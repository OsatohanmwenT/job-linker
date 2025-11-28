from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func

from app.db.database import Base


class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    job_listing_id = Column(
        String,
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

    match_score = Column(Float, nullable=False)
    skills_match = Column(Float, nullable=True)
    experience_match = Column(Float, nullable=True)
    location_match = Column(Float, nullable=True)
    salary_match = Column(Float, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
