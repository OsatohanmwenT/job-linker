# app/schemas/job_listing.py
from datetime import datetime
from typing import Optional

from pydantic import Field

from app.schemas.base import BaseSchema
from app.models.job_listing import (
    ExperienceLevel,
    JobListingStatus,
    JobListingType,
    LocationRequirement,
    WageInterval,
)


class JobListingBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    wage: Optional[int] = None
    wage_interval: Optional[WageInterval] = None
    state_abbreviation: Optional[str] = Field(None, max_length=2)
    city: Optional[str] = None
    location_requirement: LocationRequirement
    experience_level: ExperienceLevel
    type: JobListingType


class JobListingCreate(JobListingBase):
    organization_id: str
    status: JobListingStatus = JobListingStatus.DRAFT


class JobListingUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    wage: Optional[int] = None
    wage_interval: Optional[WageInterval] = None
    state_abbreviation: Optional[str] = None
    city: Optional[str] = None
    location_requirement: Optional[LocationRequirement] = None
    experience_level: Optional[ExperienceLevel] = None
    type: Optional[JobListingType] = None
    status: Optional[JobListingStatus] = None
    is_featured: Optional[bool] = None


class JobListingResponse(JobListingBase):
    id: str
    organization_id: str
    organization_name: Optional[str] = None
    status: JobListingStatus
    is_featured: bool
    posted_at: Optional[datetime]
    created_at: datetime
