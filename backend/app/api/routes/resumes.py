import base64
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.background.inngest_client import inngest_client
from app.db.database import get_db
from app.models.candidates import Candidates
from app.models.resume import Resume, ResumeParseStatus
from app.models.user import User
from app.schemas.resume import ResumeResponse

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post(
    "/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_active_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Upload a resume file (PDF/DOCX)"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(
            status_code=404, detail="Candidate profile not found. Create one first."
        )

    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are allowed"
        )

    # Read file content
    file_content = await file.read()

    # Check file size (max 5MB)
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    # For demo: store as base64 or save to local storage
    # In production, upload to S3/cloud storage and store URL
    file_url = f"local://{file.filename}"  # Placeholder

    # Check if candidate already has a resume
    existing_resume = (
        db.query(Resume).filter(Resume.candidate_id == candidate.id).first()
    )

    # Determine file type
    file_type = "pdf" if "pdf" in file.content_type else "docx"

    if existing_resume:
        # Update existing resume
        existing_resume.file_url = file_url
        existing_resume.file_name = file.filename
        existing_resume.file_type = file_type
        existing_resume.parse_status = ResumeParseStatus.PENDING
        existing_resume.extracted_text = None
        existing_resume.ai_summary = None
        db.commit()
        db.refresh(existing_resume)

        # Trigger background job to parse resume with AI
        await inngest_client.send(
            {
                "name": "app/resume.uploaded",
                "data": {
                    "candidate_id": candidate.id,
                    "file_content": base64.b64encode(file_content).decode("utf-8"),
                    "file_type": file_type,
                },
            }
        )

        return existing_resume

    # Create new resume
    new_resume = Resume(
        id=str(uuid.uuid4()),
        candidate_id=candidate.id,
        file_url=file_url,
        file_name=file.filename,
        file_type=file_type,
        parse_status=ResumeParseStatus.PENDING,
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Trigger background job to parse resume with AI
    await inngest_client.send(
        {
            "name": "app/resume.uploaded",
            "data": {
                "candidate_id": candidate.id,
                "file_content": base64.b64encode(file_content).decode("utf-8"),
                "file_type": file_type,
            },
        }
    )

    return new_resume


@router.get("/my-resume", response_model=ResumeResponse)
def get_my_resume(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get current user's resume"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded")

    return resume


@router.delete("/my-resume", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_resume(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete current user's resume"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded")

    db.delete(resume)
    db.commit()
    return None
