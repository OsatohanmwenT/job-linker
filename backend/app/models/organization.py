from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Organizations(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, index=True)
    owner_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="organizations_owned")
    job_listings = relationship(
        "JobListings", back_populates="organization", cascade="all, delete-orphan"
    )
    members = relationship(
        "OrganizationMember",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
