# app/models/saved_job.py
from sqlalchemy import Column, DateTime, ForeignKey, String, func, Integer

from app.db.database import Base


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    job_listing_id = Column(
        String,  # Changed from UUID
        ForeignKey("job_listings.id", ondelete="CASCADE"),
        primary_key=True,
    )

    saved_at = Column(DateTime(timezone=True), server_default=func.now())
