from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.job_listing import JobListingResponse


class MatchScore(BaseModel):
    """Match score breakdown"""

    match_score: float = Field(..., ge=0, le=100)
    skills_match: Optional[float] = Field(None, ge=0, le=100)
    experience_match: Optional[float] = Field(None, ge=0, le=100)
    location_match: Optional[float] = Field(None, ge=0, le=100)
    salary_match: Optional[float] = Field(None, ge=0, le=100)
    calculated_at: datetime

    class Config:
        from_attributes = True


class RankedJobListing(BaseModel):
    """Job listing with match score"""

    job: JobListingResponse
    match: MatchScore
