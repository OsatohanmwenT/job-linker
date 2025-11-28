from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.candidates import Candidates
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate_profile(
    data: CandidateCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_active_user),
):
    # Check if profile exists
    existing = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Candidate profile already exists")

    candidate = Candidates(
        id=str(current_user.id),
        user_id=current_user.id,
        current_job_title=data.current_job_title,
        experience_years=data.experience_years,
        bio=data.bio,
        location=data.location,
        desired_salary=data.desired_salary,
        desired_location=data.desired_location,
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.get("/me", response_model=CandidateResponse)
def get_my_profile(
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_active_user),
):
    profile = db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=CandidateResponse)
def update_my_profile(
    data: CandidateUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user=Depends(get_current_active_user),
):
    profile = db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
