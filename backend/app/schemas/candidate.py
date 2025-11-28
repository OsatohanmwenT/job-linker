from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CandidateBase(BaseModel):
    current_job_title: Optional[str] = Field(None, max_length=255)
    experience_years: int = Field(0, ge=0)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    desired_salary: Optional[int] = Field(None, ge=0)
    desired_location: Optional[str] = Field(None, max_length=255)


class CandidateCreate(CandidateBase):
    """Schema for creating a candidate profile"""

    pass


class CandidateUpdate(BaseModel):
    """Schema for updating a candidate profile - all fields optional"""

    current_job_title: Optional[str] = Field(None, max_length=255)
    experience_years: Optional[int] = Field(None, ge=0)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    desired_salary: Optional[int] = Field(None, ge=0)
    desired_location: Optional[str] = Field(None, max_length=255)


class CandidateResponse(CandidateBase):
    """Schema for candidate response"""

    id: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
