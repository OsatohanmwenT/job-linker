from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=50)


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateSkillCreate(BaseModel):
    skill_id: int
    proficiency_level: int = Field(..., ge=1, le=5)
    years_experience: Optional[int] = Field(None, ge=0)


class CandidateSkillUpdate(BaseModel):
    proficiency_level: Optional[int] = Field(None, ge=1, le=5)
    years_experience: Optional[int] = Field(None, ge=0)


class CandidateSkillResponse(BaseModel):
    skill_id: int
    skill_name: str
    proficiency_level: int
    years_experience: Optional[int]

    class Config:
        from_attributes = True


class JobSkillCreate(BaseModel):
    skill_id: int
    is_required: bool = True


class JobSkillResponse(BaseModel):
    skill_id: int
    skill_name: str
    is_required: bool

    class Config:
        from_attributes = True
