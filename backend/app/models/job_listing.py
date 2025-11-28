import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.orm import relationship

from app.db.database import Base


class WageInterval(str, enum.Enum):
    HOURLY = "hourly"
    YEARLY = "yearly"


class LocationRequirement(str, enum.Enum):
    IN_OFFICE = "in-office"
    HYBRID = "hybrid"
    REMOTE = "remote"


class ExperienceLevel(str, enum.Enum):
    JUNIOR = "junior"
    MID_LEVEL = "mid-level"
    SENIOR = "senior"


class JobListingStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    DELISTED = "delisted"


class JobListingType(str, enum.Enum):
    INTERNSHIP = "internship"
    PART_TIME = "part-time"
    FULL_TIME = "full-time"


class JobListings(Base):
    __tablename__ = "job_listings"

    id = Column(String, primary_key=True)  # consider UUID
    organization_id = Column(
        String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )

    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)

    wage = Column(Integer, nullable=True)
    wage_interval = Column(SQLAEnum(WageInterval), nullable=True)

    state_abbreviation = Column(String, nullable=True, index=True)
    city = Column(String, nullable=True)
    location_requirement = Column(SQLAEnum(LocationRequirement), nullable=False)

    experience_level = Column(SQLAEnum(ExperienceLevel), nullable=False)
    type = Column(SQLAEnum(JobListingType), nullable=False)

    status = Column(
        SQLAEnum(JobListingStatus), nullable=False, default=JobListingStatus.DRAFT
    )
    is_featured = Column(Boolean, default=False)
    posted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organizations", back_populates="job_listings")
    job_listing_applications = relationship(
        "JobListingApplication",
        back_populates="job_listing",
        cascade="all, delete-orphan",
    )
    skills = relationship(
        "JobSkill",
        back_populates="job_listing",
        cascade="all, delete-orphan",
    )

    @property
    def organization_name(self):
        return self.organization.name if self.organization else None
