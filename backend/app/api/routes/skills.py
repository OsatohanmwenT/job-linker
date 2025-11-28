from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.candidates import Candidates
from app.models.skills import CandidateSkill, Skill
from app.models.user import User
from app.schemas.skill import (
    CandidateSkillCreate,
    CandidateSkillResponse,
    CandidateSkillUpdate,
    SkillCreate,
    SkillResponse,
)

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/", response_model=List[SkillResponse])
def list_all_skills(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: str = None,
):
    """Get all available skills in the system"""
    query = db.query(Skill)

    if category:
        query = query.filter(Skill.category == category)

    skills = query.offset(skip).limit(limit).all()
    return skills


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_data: SkillCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new skill (for demo - normally admin only)"""
    # Check if skill already exists
    existing = db.query(Skill).filter(Skill.name == skill_data.name).first()
    if existing:
        return existing  # Return existing skill instead of error

    new_skill = Skill(
        name=skill_data.name,
        category=skill_data.category,
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@router.get("/my-skills", response_model=List[CandidateSkillResponse])
def get_my_skills(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get current user's skills"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(
            status_code=404, detail="Candidate profile not found. Create one first."
        )

    candidate_skills = (
        db.query(CandidateSkill)
        .join(Skill)
        .filter(CandidateSkill.candidate_id == candidate.id)
        .all()
    )

    return [
        CandidateSkillResponse(
            skill_id=cs.skill_id,
            skill_name=cs.skill.name,
            proficiency_level=cs.proficiency_level,
            years_experience=cs.years_experience,
        )
        for cs in candidate_skills
    ]


@router.post(
    "/my-skills",
    response_model=CandidateSkillResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_my_skill(
    skill_data: CandidateSkillCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Add a skill to current user's profile"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(
            status_code=404, detail="Candidate profile not found. Create one first."
        )

    # Verify skill exists
    skill = db.query(Skill).filter(Skill.id == skill_data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    # Check if already added
    existing = (
        db.query(CandidateSkill)
        .filter(
            CandidateSkill.candidate_id == candidate.id,
            CandidateSkill.skill_id == skill_data.skill_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Skill already added to your profile"
        )

    new_candidate_skill = CandidateSkill(
        candidate_id=candidate.id,
        skill_id=skill_data.skill_id,
        proficiency_level=skill_data.proficiency_level,
        years_experience=skill_data.years_experience,
    )
    db.add(new_candidate_skill)
    db.commit()
    db.refresh(new_candidate_skill)

    return CandidateSkillResponse(
        skill_id=new_candidate_skill.skill_id,
        skill_name=skill.name,
        proficiency_level=new_candidate_skill.proficiency_level,
        years_experience=new_candidate_skill.years_experience,
    )


@router.patch("/my-skills/{skill_id}", response_model=CandidateSkillResponse)
def update_my_skill(
    skill_id: int,
    update_data: CandidateSkillUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update proficiency level or years of experience for a skill"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    candidate_skill = (
        db.query(CandidateSkill)
        .filter(
            CandidateSkill.candidate_id == candidate.id,
            CandidateSkill.skill_id == skill_id,
        )
        .first()
    )
    if not candidate_skill:
        raise HTTPException(status_code=404, detail="Skill not found in your profile")

    # Update fields
    if update_data.proficiency_level is not None:
        candidate_skill.proficiency_level = update_data.proficiency_level
    if update_data.years_experience is not None:
        candidate_skill.years_experience = update_data.years_experience

    db.commit()
    db.refresh(candidate_skill)

    return CandidateSkillResponse(
        skill_id=candidate_skill.skill_id,
        skill_name=candidate_skill.skill.name,
        proficiency_level=candidate_skill.proficiency_level,
        years_experience=candidate_skill.years_experience,
    )


@router.delete("/my-skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_skill(
    skill_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Remove a skill from current user's profile"""
    # Get candidate profile
    candidate = (
        db.query(Candidates).filter(Candidates.user_id == current_user.id).first()
    )
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    candidate_skill = (
        db.query(CandidateSkill)
        .filter(
            CandidateSkill.candidate_id == candidate.id,
            CandidateSkill.skill_id == skill_id,
        )
        .first()
    )
    if not candidate_skill:
        raise HTTPException(status_code=404, detail="Skill not found in your profile")

    db.delete(candidate_skill)
    db.commit()
    return None
