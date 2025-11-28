from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OrganizationBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)


class OrganizationCreate(OrganizationBase):
    """Schema for creating a new organization"""

    pass


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization - all fields optional"""

    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)


class OrganizationResponse(OrganizationBase):
    """Schema for organization response"""

    id: str
    owner_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
