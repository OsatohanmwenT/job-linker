# app/models/resume.py
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class ResumeParseStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)
    candidate_id = Column(
        String,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # File info
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=True)  # pdf, docx

    # Parsed content
    extracted_text = Column(Text, nullable=True)
    parse_status = Column(Enum(ResumeParseStatus), default=ResumeParseStatus.PENDING)

    # AI-extracted summary (this is the key for matching!)
    ai_summary = Column(Text, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    parsed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    candidate = relationship("Candidates", back_populates="resumes")
