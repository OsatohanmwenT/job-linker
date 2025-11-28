# app/models/application.py
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class ApplicationStage(str, enum.Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    SHORTLISTED = "shortlisted"
    DENIED = "denied"
    APPLIED = "applied"
    INTERESTED = "interested"
    INTERVIEWED = "interviewed"
    HIRED = "hired"


class JobListingApplication(Base):
    __tablename__ = "job_listing_applications"

    # Fix: job_listing uses String ID, not UUID
    job_listing_id = Column(
        String,  # Changed from UUID to match JobListing
        ForeignKey("job_listings.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    cover_letter = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True, index=True)  # 0-100 match score
    ai_analysis = Column(Text, nullable=True)  # AI-generated reasoning
    stage = Column(
        Enum(ApplicationStage), nullable=False, default=ApplicationStage.APPLIED
    )

    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job_listing = relationship("JobListings", back_populates="job_listing_applications")
    user = relationship("User", back_populates="job_listing_applications")
