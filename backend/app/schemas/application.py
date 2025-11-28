# app/schemas/application.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.application import ApplicationStage


class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    job_listing_id: str
    # user_id is taken from current_user in endpoint, not from request body


class ApplicationUpdate(BaseModel):
    stage: Optional[ApplicationStage] = None
    rating: Optional[int] = Field(None, ge=0, le=100)


class ApplicationResponse(ApplicationBase):
    job_listing_id: str
    user_id: int  # Changed from str to int to match database model
    rating: Optional[int] = None
    ai_analysis: Optional[str] = None
    stage: ApplicationStage
    applied_at: datetime

    # Nested user info
    user: dict  # Will contain user details

    class Config:
        from_attributes = True


class ApplicationStats(BaseModel):
    total: int
    excellent_matches: int  # 90-100
    good_matches: int  # 75-89
    needs_review: int  # <75
