# app/schemas/candidate_match.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CandidateMatchResponse(BaseModel):
    job_listing_id: str
    user_id: str
    match_score: float = Field(..., ge=0, le=100)
    skills_match: Optional[float] = None
    experience_match: Optional[float] = None
    location_match: Optional[float] = None
    salary_match: Optional[float] = None
    calculated_at: datetime
    
    class Config:
        from_attributes = True

class MatchedJobResponse(BaseModel):
    job_listing: dict  # JobListingResponse
    match_score: float
    match_breakdown: dict  # Detailed breakdown