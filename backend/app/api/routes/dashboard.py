from typing import Annotated

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.application import ApplicationStage, JobListingApplication
from app.models.job_listing import JobListings, JobListingStatus
from app.models.organization import Organizations
from app.models.user import User
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/employer")
async def get_employer_dashboard(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get dashboard statistics for employer"""

    # Get user's organization
    org = (
        db.query(Organizations)
        .filter(Organizations.owner_user_id == current_user.id)
        .first()
    )

    if not org:
        return {
            "active_jobs": 0,
            "total_applications": 0,
            "pending_review": 0,
            "shortlisted": 0,
            "hired": 0,
            "recent_applications": [],
            "recent_jobs": [],
        }

    # Get active job listings count
    active_jobs = (
        db.query(func.count(JobListings.id))
        .filter(
            JobListings.organization_id == org.id,
            JobListings.status == JobListingStatus.PUBLISHED,
        )
        .scalar()
        or 0
    )

    # Get all job listings for this organization
    org_job_ids = (
        db.query(JobListings.id).filter(JobListings.organization_id == org.id).all()
    )
    org_job_ids = [job_id[0] for job_id in org_job_ids]

    # Get total applications count
    total_applications = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(JobListingApplication.job_listing_id.in_(org_job_ids))
        .scalar()
        or 0
    )

    # Get pending review count (APPLIED stage)
    pending_review = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id.in_(org_job_ids),
            JobListingApplication.stage == ApplicationStage.APPLIED,
        )
        .scalar()
        or 0
    )

    # Get shortlisted count
    shortlisted = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id.in_(org_job_ids),
            JobListingApplication.stage == ApplicationStage.SHORTLISTED,
        )
        .scalar()
        or 0
    )

    # Get hired count
    hired = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id.in_(org_job_ids),
            JobListingApplication.stage == ApplicationStage.HIRED,
        )
        .scalar()
        or 0
    )

    # Get recent applications (last 5) with relationships
    from sqlalchemy.orm import joinedload

    recent_applications = (
        db.query(JobListingApplication)
        .options(joinedload(JobListingApplication.user))
        .options(joinedload(JobListingApplication.job_listing))
        .filter(JobListingApplication.job_listing_id.in_(org_job_ids))
        .order_by(JobListingApplication.applied_at.desc())
        .limit(5)
        .all()
    )

    # Get recent jobs (last 5)
    recent_jobs = (
        db.query(JobListings)
        .filter(JobListings.organization_id == org.id)
        .order_by(JobListings.posted_at.desc())
        .limit(5)
        .all()
    )

    return {
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "pending_review": pending_review,
        "shortlisted": shortlisted,
        "hired": hired,
        "recent_applications": [
            {
                "id": f"{app.job_listing_id}_{app.user_id}",
                "job_listing_id": app.job_listing_id,
                "user_id": app.user_id,
                "user_name": app.user.name if app.user else "Unknown",
                "user_email": app.user.email if app.user else "",
                "job_title": app.job_listing.title if app.job_listing else "Unknown",
                "rating": app.rating,
                "stage": app.stage.value,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            }
            for app in recent_applications
        ],
        "recent_jobs": [
            {
                "id": job.id,
                "title": job.title,
                "status": job.status.value,
                "type": job.type.value,
                "location_requirement": job.location_requirement.value,
                "posted_at": job.posted_at.isoformat() if job.posted_at else None,
                "applications_count": (
                    db.query(func.count(JobListingApplication.user_id))
                    .filter(JobListingApplication.job_listing_id == job.id)
                    .scalar()
                    or 0
                ),
            }
            for job in recent_jobs
        ],
    }
