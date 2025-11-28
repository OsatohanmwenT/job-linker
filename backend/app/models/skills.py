# app/models/skill.py
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=True)  # e.g., "Programming", "Design"

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    candidate_id = Column(
        String,  # Changed from UUID
        ForeignKey("candidates.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id = Column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )

    proficiency_level = Column(Integer, default=3)  # 1-5 scale
    years_experience = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    candidate = relationship("Candidates", back_populates="skills")
    skill = relationship("Skill")


class JobSkill(Base):
    __tablename__ = "job_skills"

    job_listing_id = Column(
        String,  # Changed from UUID
        ForeignKey("job_listings.id", ondelete="CASCADE"),
        primary_key=True,
    )
    skill_id = Column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )

    is_required = Column(Integer, default=1)  # 1=required, 0=preferred

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job_listing = relationship("JobListings", back_populates="skills")
    skill = relationship("Skill")
