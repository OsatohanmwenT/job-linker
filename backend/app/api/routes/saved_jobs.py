# app/api/routes/saved_jobs.py
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.job_listing import JobListings
from app.models.saved_jobs import SavedJob
from app.models.user import User

router = APIRouter(prefix="/saved-jobs", tags=["saved-jobs"])


@router.post("/{job_id}", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Save a job listing to favorites"""
    # Verify job exists
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Check if already saved
    existing = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_listing_id == job_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")

    # Create saved job
    saved_job = SavedJob(
        user_id=current_user.id,
        job_listing_id=job_id,
    )

    db.add(saved_job)
    db.commit()

    return {
        "user_id": saved_job.user_id,
        "job_listing_id": saved_job.job_listing_id,
        "saved_at": saved_job.saved_at,
        "message": "Job saved successfully",
    }


@router.get("/")
def get_saved_jobs(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get all saved jobs for the current user"""
    saved_jobs = (
        db.query(SavedJob, JobListings)
        .join(JobListings, SavedJob.job_listing_id == JobListings.id)
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.saved_at.desc())
        .all()
    )

    return [
        {
            "saved_at": saved_job.saved_at,
            "job_listing": {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "organization_id": job.organization_id,
                "wage": job.wage,
                "wage_interval": job.wage_interval.value if job.wage_interval else None,
                "city": job.city,
                "state_abbreviation": job.state_abbreviation,
                "location_requirement": job.location_requirement.value,
                "experience_level": job.experience_level.value,
                "type": job.type.value,
                "status": job.status.value,
                "posted_at": job.posted_at,
            },
        }
        for saved_job, job in saved_jobs
    ]


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_job(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Remove a job from saved jobs"""
    saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_listing_id == job_id,
        )
        .first()
    )

    if not saved_job:
        raise HTTPException(status_code=404, detail="Saved job not found")

    db.delete(saved_job)
    db.commit()

    return None


@router.get("/check/{job_id}")
def check_if_saved(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Check if a specific job is saved by the current user"""
    saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_listing_id == job_id,
        )
        .first()
    )

    return {
        "job_listing_id": job_id,
        "is_saved": saved_job is not None,
        "saved_at": saved_job.saved_at if saved_job else None,
    }
