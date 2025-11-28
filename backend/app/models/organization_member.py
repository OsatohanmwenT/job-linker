# app/models/organization_member.py
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class MemberRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    role = Column(Enum(MemberRole), nullable=False, default=MemberRole.MEMBER)

    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organizations", back_populates="members")
    user = relationship("User", back_populates="organization_memberships")
