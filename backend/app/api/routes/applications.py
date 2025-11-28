from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user, get_current_user
from app.core.background.inngest_client import inngest_client
from app.db.database import get_db
from app.models.application import ApplicationStage, JobListingApplication
from app.models.candidates import Candidates
from app.models.job_listing import JobListings, JobListingStatus
from app.models.user import User
from app.models.organization import Organizations
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post(
    "/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED
)
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Apply to a job listing (create application)"""
    # Verify job exists and is published
    job = (
        db.query(JobListings)
        .filter(JobListings.id == application_data.job_listing_id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    if job.status != JobListingStatus.PUBLISHED:
        raise HTTPException(
            status_code=400, detail="Cannot apply to unpublished job listing"
        )

    # Check if already applied
    existing = (
        db.query(JobListingApplication)
        .filter(
            JobListingApplication.job_listing_id == application_data.job_listing_id,
            JobListingApplication.user_id == current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="You have already applied to this job"
        )

    # Create application
    new_application = JobListingApplication(
        job_listing_id=application_data.job_listing_id,
        user_id=current_user.id,
        cover_letter=application_data.cover_letter,
        stage=ApplicationStage.APPLIED,
        rating=None,  # Will be calculated by background job/AI
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    # Load user relationship for response
    db.refresh(new_application, ["user"])

    # Get candidate_id for the Inngest event
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )

    # Trigger background job to rank applicant
    if candidate:
        await inngest_client.send(
            {
                "name": "app/application.created",
                "data": {
                    "job_listing_id": application_data.job_listing_id,
                    "candidate_id": candidate.id,
                },
            }
        )

    # Construct response manually to include user info
    response_data = {
        "job_listing_id": new_application.job_listing_id,
        "user_id": new_application.user_id,
        "cover_letter": new_application.cover_letter,
        "rating": new_application.rating,
        "stage": new_application.stage,
        "applied_at": new_application.applied_at,
        "user": {
            "id": new_application.user.id,
            "name": new_application.user.name,
            "email": new_application.user.email,
            "image_url": (
                new_application.user.image_url
                if new_application.user.image_url
                else None
            ),
        },
    }
    return response_data


@router.get("/job/{job_id}")
async def get_job_applications(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    sort_by: str = Query("rating", regex="^(rating|applied_at)$"),
    stage_filter: Optional[ApplicationStage] = None,
    min_rating: Optional[int] = Query(None, ge=0, le=100),
):
    """Get all applications for a job listing, sorted by AI match score"""

    # Verify job exists and user has permission
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Check if user is member/admin of organization
    # (Add your permission check here)

    # Build query
    query = (
        db.query(JobListingApplication)
        .filter(JobListingApplication.job_listing_id == job_id)
        .options(joinedload(JobListingApplication.user))
    )

    # Apply filters
    if stage_filter:
        query = query.filter(JobListingApplication.stage == stage_filter)

    if min_rating is not None:
        query = query.filter(JobListingApplication.rating >= min_rating)

    # Sort
    if sort_by == "rating":
        query = query.order_by(JobListingApplication.rating.desc().nulls_last())
    else:
        query = query.order_by(JobListingApplication.applied_at.desc())

    applications = query.all()

    # Format response with user info
    return [
        {
            "job_listing_id": app.job_listing_id,
            "user_id": app.user_id,
            "cover_letter": app.cover_letter,
            "rating": app.rating,
            "ai_analysis": app.ai_analysis,
            "stage": app.stage,
            "applied_at": app.applied_at,
            "user": {
                "id": app.user.id,
                "name": app.user.name,
                "email": app.user.email,
                "image_url": app.user.image_url,
            },
        }
        for app in applications
    ]


@router.get("/job/{job_id}/stats")
async def get_application_stats(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get statistics about applications for a job"""

    # Verify permission
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Calculate stats
    total = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(JobListingApplication.job_listing_id == job_id)
        .scalar()
        or 0
    )

    excellent = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id == job_id,
            JobListingApplication.rating >= 90,
        )
        .scalar()
        or 0
    )

    good = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id == job_id,
            JobListingApplication.rating >= 75,
            JobListingApplication.rating < 90,
        )
        .scalar()
        or 0
    )

    needs_review = (
        db.query(func.count(JobListingApplication.user_id))
        .filter(
            JobListingApplication.job_listing_id == job_id,
            JobListingApplication.rating < 75,
        )
        .scalar()
        or 0
    )

    return {
        "total": total,
        "excellent_matches": excellent,
        "good_matches": good,
        "needs_review": needs_review,
    }


@router.patch("/{job_id}/{user_id}")
async def update_application_stage(
    job_id: str,
    user_id: str,
    update_data: ApplicationUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update application stage (move through pipeline)"""

    application = (
        db.query(JobListingApplication)
        .filter(
            JobListingApplication.job_listing_id == job_id,
            JobListingApplication.user_id == user_id,
        )
        .options(
            joinedload(JobListingApplication.job_listing),
            joinedload(JobListingApplication.user),
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify permission
    # (Check if user is org admin/member)

    # Update stage
    if update_data.stage:
        application.stage = update_data.stage

    db.commit()
    db.refresh(application)

    return application


@router.get("/check/{job_id}")
async def check_application_status(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Check if the current user has applied to a specific job
    Returns application details if exists, or 404 if not applied
    """
    application = (
        db.query(JobListingApplication)
        .filter(
            JobListingApplication.job_listing_id == job_id,
            JobListingApplication.user_id == current_user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="You have not applied to this job")

    return {
        "has_applied": True,
        "job_listing_id": application.job_listing_id,
        "applied_at": application.applied_at,
        "stage": application.stage,
        "rating": application.rating,
    }


@router.get("/me")
async def get_my_applications(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    stage_filter: Optional[ApplicationStage] = None,
):
    """
    Get all applications submitted by the current user (job seeker view)
    Returns applications with job details
    """
    query = (
        db.query(JobListingApplication)
        .filter(JobListingApplication.user_id == current_user.id)
        .options(joinedload(JobListingApplication.job_listing))
    )

    if stage_filter:
        query = query.filter(JobListingApplication.stage == stage_filter)

    query = query.order_by(JobListingApplication.applied_at.desc())
    applications = query.all()

    return [
        {
            "job_listing_id": app.job_listing_id,
            "user_id": app.user_id,
            "cover_letter": app.cover_letter,
            "rating": app.rating,
            "ai_analysis": app.ai_analysis,
            "stage": app.stage,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "job_listing": {
                "id": app.job_listing.id,
                "title": app.job_listing.title,
                "description": app.job_listing.description,
                "organization_id": app.job_listing.organization_id,
                "wage": app.job_listing.wage,
                "wage_interval": (
                    app.job_listing.wage_interval.value
                    if app.job_listing.wage_interval
                    else None
                ),
                "city": app.job_listing.city,
                "state_abbreviation": app.job_listing.state_abbreviation,
                "location_requirement": app.job_listing.location_requirement.value,
                "experience_level": app.job_listing.experience_level.value,
                "type": app.job_listing.type.value,
                "status": app.job_listing.status.value,
                "posted_at": app.job_listing.posted_at,
            },
        }
        for app in applications
    ]


@router.get("/organization/{org_id}")
async def get_organization_applications(
    org_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    stage_filter: Optional[ApplicationStage] = None,
):
    """Get all applications for an organization"""
    # Verify organization exists and user has permission
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Ensure type consistency for comparison
    org_owner_id = (
        int(org.owner_user_id)
        if isinstance(org.owner_user_id, str)
        else org.owner_user_id
    )
    if org_owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this organization's applications"
        )

    # Build query
    query = (
        db.query(JobListingApplication)
        .join(JobListings)
        .filter(JobListings.organization_id == org_id)
        .options(
            joinedload(JobListingApplication.job_listing),
            joinedload(JobListingApplication.user),
        )
    )

    if stage_filter:
        query = query.filter(JobListingApplication.stage == stage_filter)

    query = query.order_by(JobListingApplication.applied_at.desc())
    applications = query.all()

    return [
        {
            "job_listing_id": app.job_listing_id,
            "user_id": app.user_id,
            "cover_letter": app.cover_letter,
            "rating": app.rating,
            "ai_analysis": app.ai_analysis,
            "stage": app.stage,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "user": {
                "id": app.user.id,
                "name": app.user.name,
                "email": app.user.email,
                "image_url": app.user.image_url,
            },
            "job_listing": {
                "id": app.job_listing.id,
                "title": app.job_listing.title,
                "status": app.job_listing.status.value,
            },
        }
        for app in applications
    ]
