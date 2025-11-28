# app/models/user.py
from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("Candidates", back_populates="user", uselist=False)
    job_listing_applications = relationship(
        "JobListingApplication", back_populates="user", overlaps="applications"
    )
    organizations_owned = relationship(
        "Organizations",
        foreign_keys="Organizations.owner_user_id",
        back_populates="owner",
    )
    organization_memberships = relationship(
        "OrganizationMember", back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
