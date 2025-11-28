# app/schemas/organization_member.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OrganizationMemberBase(BaseModel):
    role: str


class OrganizationMemberAdd(BaseModel):
    """Schema for adding a member to organization"""

    user_id: int
    role: str = "member"  # owner, admin, member


class OrganizationMemberUpdate(BaseModel):
    """Schema for updating member role"""

    role: str  # owner, admin, member


class OrganizationMemberResponse(OrganizationMemberBase):
    """Schema for organization member response"""

    organization_id: str
    user_id: int
    added_at: datetime
    # Include user details
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True
