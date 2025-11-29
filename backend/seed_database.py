"""
Database seeding script for JobLinker
Run with: python seed_database.py
"""

import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

import uuid

from app.db.database import Base, SessionLocal, engine
from app.models.candidates import Candidates
from app.models.job_listing import (
    ExperienceLevel,
    JobListings,
    JobListingStatus,
    JobListingType,
    LocationRequirement,
    WageInterval,
)
from app.models.organization import Organizations
from app.models.skills import Skill
from app.models.user import User
from app.utils.auth import hash_password
from sqlalchemy.orm import Session


def generate_id():
    """Generate a UUID string"""
    return str(uuid.uuid4())


def seed_users(db: Session):
    """Create sample users"""
    print("Creating users...")

    users_data = [
        {
            "email": "employer1@example.com",
            "name": "Alice Johnson",
            "password": "Password123!",
        },
        {
            "email": "employer2@example.com",
            "name": "Bob Smith",
            "password": "Password123!",
        },
        {
            "email": "jobseeker1@example.com",
            "name": "Charlie Brown",
            "password": "Password123!",
        },
        {
            "email": "jobseeker2@example.com",
            "name": "Diana Prince",
            "password": "Password123!",
        },
        {
            "email": "jobseeker3@example.com",
            "name": "Ethan Hunt",
            "password": "Password123!",
        },
    ]

    users = []
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"  User {user_data['email']} already exists, skipping...")
            users.append(existing_user)
            continue

        user = User(
            email=user_data["email"],
            name=user_data["name"],
            hashed_password=hash_password(user_data["password"]),
            is_active=True,
        )
        db.add(user)
        users.append(user)
        print(f"  Created user: {user_data['email']}")

    db.commit()
    print(f"✓ Created {len(users)} users")
    return users


def seed_organizations(db: Session, users: list):
    """Create sample organizations"""
    print("\nCreating organizations...")

    orgs_data = [
        {
            "name": "TechCorp Inc",
            "description": "Leading technology company specializing in AI and cloud solutions",
            "location": "San Francisco, CA",
            "website": "https://techcorp.example.com",
            "owner_index": 0,
        },
        {
            "name": "DataSystems LLC",
            "description": "Enterprise data management and analytics platform",
            "location": "New York, NY",
            "website": "https://datasystems.example.com",
            "owner_index": 1,
        },
    ]

    organizations = []
    for org_data in orgs_data:
        org_id = generate_id()

        # Check if org already exists
        existing_org = (
            db.query(Organizations)
            .filter(Organizations.name == org_data["name"])
            .first()
        )
        if existing_org:
            print(f"  Organization {org_data['name']} already exists, skipping...")
            organizations.append(existing_org)
            continue

        org = Organizations(
            id=org_id,
            owner_user_id=users[org_data["owner_index"]].id,
            name=org_data["name"],
            description=org_data["description"],
            location=org_data["location"],
            website=org_data["website"],
        )
        db.add(org)
        organizations.append(org)
        print(f"  Created organization: {org_data['name']}")

    db.commit()
    print(f"✓ Created {len(organizations)} organizations")
    return organizations


def seed_job_listings(db: Session, organizations: list):
    """Create sample job listings"""
    print("\nCreating job listings...")

    jobs_data = [
        {
            "title": "Senior Full Stack Developer",
            "description": "We're looking for an experienced full stack developer to join our team. You'll work on cutting-edge AI applications using React, Node.js, and Python. Must have 5+ years of experience.",
            "wage": 150000,
            "wage_interval": WageInterval.YEARLY,
            "state_abbreviation": "CA",
            "city": "San Francisco",
            "location_requirement": LocationRequirement.HYBRID,
            "experience_level": ExperienceLevel.SENIOR,
            "type": JobListingType.FULL_TIME,
            "status": JobListingStatus.PUBLISHED,
            "org_index": 0,
        },
        {
            "title": "Frontend Engineer (React)",
            "description": "Join our frontend team to build beautiful, responsive web applications. Experience with React, TypeScript, and modern CSS frameworks required.",
            "wage": 120000,
            "wage_interval": WageInterval.YEARLY,
            "state_abbreviation": "CA",
            "city": "San Francisco",
            "location_requirement": LocationRequirement.REMOTE,
            "experience_level": ExperienceLevel.MID_LEVEL,
            "type": JobListingType.FULL_TIME,
            "status": JobListingStatus.PUBLISHED,
            "org_index": 0,
        },
        {
            "title": "Data Engineer",
            "description": "Build and maintain data pipelines using Python, SQL, and cloud technologies. Experience with AWS or GCP required.",
            "wage": 140000,
            "wage_interval": WageInterval.YEARLY,
            "state_abbreviation": "NY",
            "city": "New York",
            "location_requirement": LocationRequirement.IN_OFFICE,
            "experience_level": ExperienceLevel.SENIOR,
            "type": JobListingType.FULL_TIME,
            "status": JobListingStatus.PUBLISHED,
            "org_index": 1,
        },
        {
            "title": "Junior Software Developer",
            "description": "Entry-level position for recent graduates or career changers. We'll train you on our tech stack and best practices.",
            "wage": 75000,
            "wage_interval": WageInterval.YEARLY,
            "state_abbreviation": "NY",
            "city": "New York",
            "location_requirement": LocationRequirement.HYBRID,
            "experience_level": ExperienceLevel.JUNIOR,
            "type": JobListingType.FULL_TIME,
            "status": JobListingStatus.PUBLISHED,
            "org_index": 1,
        },
        {
            "title": "DevOps Engineer",
            "description": "Manage our cloud infrastructure and CI/CD pipelines. Kubernetes, Docker, and Terraform experience required.",
            "wage": 135000,
            "wage_interval": WageInterval.YEARLY,
            "state_abbreviation": "CA",
            "city": "San Francisco",
            "location_requirement": LocationRequirement.REMOTE,
            "experience_level": ExperienceLevel.MID_LEVEL,
            "type": JobListingType.FULL_TIME,
            "status": JobListingStatus.PUBLISHED,
            "org_index": 0,
        },
    ]

    job_listings = []
    for job_data in jobs_data:
        job_id = generate_id()

        # Check if job already exists
        existing_job = (
            db.query(JobListings)
            .filter(
                JobListings.title == job_data["title"],
                JobListings.organization_id == organizations[job_data["org_index"]].id,
            )
            .first()
        )
        if existing_job:
            print(f"  Job {job_data['title']} already exists, skipping...")
            job_listings.append(existing_job)
            continue

        job = JobListings(
            id=job_id,
            organization_id=organizations[job_data["org_index"]].id,
            title=job_data["title"],
            description=job_data["description"],
            wage=job_data["wage"],
            wage_interval=job_data["wage_interval"],
            state_abbreviation=job_data["state_abbreviation"],
            city=job_data["city"],
            location_requirement=job_data["location_requirement"],
            experience_level=job_data["experience_level"],
            type=job_data["type"],
            status=job_data["status"],
            is_featured=False,
            posted_at=datetime.utcnow() - timedelta(days=5),
        )
        db.add(job)
        job_listings.append(job)
        print(f"  Created job: {job_data['title']}")

    db.commit()
    print(f"✓ Created {len(job_listings)} job listings")
    return job_listings


def seed_candidates(db: Session, users: list):
    """Create sample candidates"""
    print("\nCreating candidates...")

    # Candidates are job seekers (users index 2, 3, 4)
    candidates_data = [
        {
            "user_index": 2,
            "location": "San Francisco, CA",
            "current_job_title": "Full Stack Developer",
            "experience_years": 3,
            "bio": "Passionate developer with expertise in React, Node.js, and Python",
        },
        {
            "user_index": 3,
            "location": "New York, NY",
            "current_job_title": "Data Analyst",
            "experience_years": 2,
            "bio": "Strong analytical skills with Python and SQL experience, transitioning to Data Engineering",
        },
        {
            "user_index": 4,
            "location": "Austin, TX",
            "current_job_title": "Junior Developer",
            "experience_years": 0,
            "bio": "Recent bootcamp graduate with portfolio of projects seeking first role",
        },
    ]

    candidates = []
    for cand_data in candidates_data:
        user = users[cand_data["user_index"]]

        # Check if candidate already exists
        existing_candidate = (
            db.query(Candidates).filter(Candidates.user_id == user.id).first()
        )
        if existing_candidate:
            print(f"  Candidate for user {user.email} already exists, skipping...")
            candidates.append(existing_candidate)
            continue

        candidate = Candidates(
            id=generate_id(),
            user_id=user.id,
            location=cand_data["location"],
            current_job_title=cand_data["current_job_title"],
            experience_years=cand_data["experience_years"],
            bio=cand_data["bio"],
        )
        db.add(candidate)
        candidates.append(candidate)
        print(f"  Created candidate: {user.name}")

    db.commit()
    print(f"✓ Created {len(candidates)} candidates")
    return candidates


def seed_skills(db: Session):
    """Create sample skills"""
    print("\nCreating skills...")

    skills_data = [
        "Python",
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "FastAPI",
        "PostgreSQL",
        "MongoDB",
        "Docker",
        "Kubernetes",
        "AWS",
        "GCP",
        "CI/CD",
        "Git",
        "Agile",
        "REST APIs",
        "GraphQL",
        "SQL",
        "HTML/CSS",
        "Tailwind CSS",
    ]

    skills = []
    for skill_name in skills_data:
        # Check if skill already exists
        existing_skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if existing_skill:
            skills.append(existing_skill)
            continue

        skill = Skill(name=skill_name)
        db.add(skill)
        skills.append(skill)

    db.commit()
    print(f"✓ Created {len([s for s in skills if s.name in skills_data])} skills")
    return skills


def main():
    """Main seeding function"""
    print("=" * 60)
    print("JobLinker Database Seeding Script")
    print("=" * 60)

    # Create all tables
    print("\nCreating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")

    # Create session
    db = SessionLocal()

    try:
        # Seed data in order
        users = seed_users(db)
        organizations = seed_organizations(db, users)
        job_listings = seed_job_listings(db, organizations)
        candidates = seed_candidates(db, users)
        skills = seed_skills(db)

        print("\n" + "=" * 60)
        print("✓ Database seeding completed successfully!")
        print("=" * 60)
        print("\nSeeded data summary:")
        print(f"  - Users: {len(users)}")
        print(f"  - Organizations: {len(organizations)}")
        print(f"  - Job Listings: {len(job_listings)}")
        print(f"  - Candidates: {len(candidates)}")
        print(f"  - Skills: {len(skills)}")
        print("\nTest credentials:")
        print("  Employer 1: employer1@example.com / Password123!")
        print("  Employer 2: employer2@example.com / Password123!")
        print("  Job Seeker 1: jobseeker1@example.com / Password123!")
        print("  Job Seeker 2: jobseeker2@example.com / Password123!")
        print("  Job Seeker 3: jobseeker3@example.com / Password123!")

    except Exception as e:
        print(f"\n✗ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
