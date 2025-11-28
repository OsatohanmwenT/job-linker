from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Candidates(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Profile fields
    current_job_title = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)

    # Job preferences for matching
    desired_salary = Column(Integer, nullable=True)
    desired_location = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="candidate")
    skills = relationship(
        "CandidateSkill", back_populates="candidate", cascade="all, delete-orphan"
    )
    resumes = relationship(
        "Resume", back_populates="candidate", cascade="all, delete-orphan"
    )
    applications = relationship(
        "JobListingApplication",
        foreign_keys="JobListingApplication.user_id",
        primaryjoin="Candidates.user_id==JobListingApplication.user_id",
        overlaps="user",
    )
    matches = relationship(
        "CandidateMatch",
        foreign_keys="CandidateMatch.user_id",
        primaryjoin="Candidates.user_id==CandidateMatch.user_id",
        cascade="all, delete-orphan",
    )
