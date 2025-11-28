# app/api/v1/job_listings.py
import uuid
from datetime import datetime, timezone
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.job_listing import (
    ExperienceLevel,
    JobListings,
    JobListingStatus,
    LocationRequirement,
)
from app.models.organization import Organizations
from app.models.user import User
from app.schemas.job_listing import (
    JobListingCreate,
    JobListingResponse,
    JobListingUpdate,
)

router = APIRouter(prefix="/job-listings", tags=["job-listings"])


@router.get("/", response_model=List[JobListingResponse])
def get_public_job_listings(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    location: Optional[str] = None,
    experience_level: Optional[ExperienceLevel] = None,
    min_wage: Optional[int] = Query(None, ge=0),
    location_requirement: Optional[LocationRequirement] = None,
):
    """Get all published job listings (public endpoint with filters and pagination)"""
    query = db.query(JobListings).filter(
        JobListings.status == JobListingStatus.PUBLISHED
    )

    # Apply filters
    if search:
        # Search in title and description
        search_pattern = f"%{search}%"
        query = query.filter(
            (JobListings.title.ilike(search_pattern))
            | (JobListings.description.ilike(search_pattern))
        )

    if location:
        query = query.filter(
            (JobListings.city.ilike(f"%{location}%"))
            | (JobListings.state_abbreviation.ilike(f"%{location}%"))
        )

    if experience_level:
        query = query.filter(JobListings.experience_level == experience_level)

    if min_wage is not None:
        query = query.filter(JobListings.wage >= min_wage)

    if location_requirement:
        query = query.filter(JobListings.location_requirement == location_requirement)

    # Order by posted_at descending (newest first), then by created_at
    query = query.order_by(
        JobListings.posted_at.desc().nulls_last(), JobListings.created_at.desc()
    )

    # Apply pagination
    jobs = query.offset(skip).limit(limit).all()

    return jobs


def check_org_permission(org_id: str, user_id: int, db: Session) -> Organizations:
    """Check if user has permission to manage organization"""
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Ensure type consistency for comparison
    org_owner_id = (
        int(org.owner_user_id)
        if isinstance(org.owner_user_id, str)
        else org.owner_user_id
    )
    if org_owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to manage this organization"
        )

    return org


@router.post(
    "/", response_model=JobListingResponse, status_code=status.HTTP_201_CREATED
)
def create_job_listing(
    job_data: JobListingCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new job listing"""
    # Check organization permission
    check_org_permission(job_data.organization_id, current_user.id, db)

    # Create job listing
    new_job = JobListings(
        id=str(uuid.uuid4()),
        organization_id=job_data.organization_id,
        title=job_data.title,
        description=job_data.description,
        wage=job_data.wage,
        wage_interval=job_data.wage_interval,
        state_abbreviation=job_data.state_abbreviation,
        city=job_data.city,
        location_requirement=job_data.location_requirement,
        experience_level=job_data.experience_level,
        type=job_data.type,
        status=job_data.status,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


@router.get("/organization/{org_id}", response_model=List[JobListingResponse])
def get_organization_job_listings(
    org_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    status_filter: JobListingStatus = None,
):
    """Get all job listings for an organization"""
    # Verify organization exists
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    query = db.query(JobListings).filter(JobListings.organization_id == org_id)

    if status_filter:
        query = query.filter(JobListings.status == status_filter)

    jobs = query.order_by(JobListings.created_at.desc()).all()
    return jobs


@router.patch("/{job_id}", response_model=JobListingResponse)
def update_job_listing(
    job_id: str,
    job_data: JobListingUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update a job listing"""
    # Get job listing
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Check permission
    check_org_permission(job.organization_id, current_user.id, db)

    # Update fields
    update_data = job_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    # Set posted_at if publishing
    if job_data.status == JobListingStatus.PUBLISHED and not job.posted_at:
        job.posted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(job)

    return job


@router.get("/{job_id}", response_model=JobListingResponse)
def get_job_listing(job_id: str, db: Annotated[Session, Depends(get_db)]):
    """Get a single job listing (public)"""
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_listing(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a job listing"""
    job = db.query(JobListings).filter(JobListings.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found")

    # Check permission
    check_org_permission(job.organization_id, current_user.id, db)

    db.delete(job)
    db.commit()

    return None
