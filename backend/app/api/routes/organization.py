import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.organization import Organizations
from app.models.organization_member import MemberRole, OrganizationMember
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.schemas.organization_member import (
    OrganizationMemberAdd,
    OrganizationMemberResponse,
    OrganizationMemberUpdate,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


def check_org_ownership(org_id: str, user: User, db: Session) -> Organizations:
    """Helper to verify organization ownership"""
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )
    if org.owner_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this organization",
        )
    return org


@router.post(
    "/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED
)
def create_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new organization owned by the current user"""
    new_org = Organizations(
        id=str(uuid.uuid4()),
        owner_user_id=current_user.id,
        name=org_data.name,
        description=org_data.description,
        location=org_data.location,
        website=org_data.website,
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org


@router.get("/", response_model=List[OrganizationResponse])
def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all organizations owned by the current user"""
    orgs = (
        db.query(Organizations)
        .filter(Organizations.owner_user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orgs


@router.get("/me", response_model=List[OrganizationResponse])
def get_my_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all organizations where current user is owner or member"""
    # Get owned organizations
    owned_orgs = (
        db.query(Organizations)
        .filter(Organizations.owner_user_id == current_user.id)
        .all()
    )

    # Get organizations where user is a member
    member_orgs = (
        db.query(Organizations)
        .join(OrganizationMember)
        .filter(OrganizationMember.user_id == current_user.id)
        .filter(Organizations.owner_user_id != current_user.id)  # Exclude owned ones
        .all()
    )

    return owned_orgs + member_orgs


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific organization (ownership verified)"""
    org = check_org_ownership(org_id, current_user, db)
    return org


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: str,
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update an organization (ownership required)"""
    org = check_org_ownership(org_id, current_user, db)

    # Update only provided fields
    update_data = org_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(org, field, value)

    db.commit()
    db.refresh(org)
    return org


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an organization (ownership required)"""
    org = check_org_ownership(org_id, current_user, db)
    db.delete(org)
    db.commit()
    return None


@router.get("/{org_id}/members", response_model=List[OrganizationMemberResponse])
def get_organization_members(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all members of an organization"""
    # Check if user has access to org
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    # Check if user is owner or member
    is_owner = org.owner_user_id == current_user.id
    is_member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
        .first()
        is not None
    )

    if not is_owner and not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this organization's members",
        )

    # Get all members
    members = (
        db.query(OrganizationMember, User)
        .join(User, OrganizationMember.user_id == User.id)
        .filter(OrganizationMember.organization_id == org_id)
        .all()
    )

    # Format response
    result = []
    for member, user in members:
        result.append(
            OrganizationMemberResponse(
                organization_id=member.organization_id,
                user_id=member.user_id,
                role=member.role.value,
                added_at=member.added_at,
                user_name=user.name,
                user_email=user.email,
            )
        )

    return result


@router.post(
    "/{org_id}/members",
    response_model=OrganizationMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_organization_member(
    org_id: str,
    member_data: OrganizationMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add a member to an organization (owner or admin only)"""
    # Check if user is owner or admin
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    is_owner = org.owner_user_id == current_user.id
    user_membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
        .first()
    )
    is_admin = user_membership and user_membership.role == MemberRole.ADMIN

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization owners and admins can add members",
        )

    # Check if user exists
    target_user = db.query(User).filter(User.id == member_data.user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if already a member
    existing_member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == member_data.user_id,
        )
        .first()
    )
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this organization",
        )

    # Add member
    new_member = OrganizationMember(
        organization_id=org_id,
        user_id=member_data.user_id,
        role=MemberRole(member_data.role),
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return OrganizationMemberResponse(
        organization_id=new_member.organization_id,
        user_id=new_member.user_id,
        role=new_member.role.value,
        added_at=new_member.added_at,
        user_name=target_user.name,
        user_email=target_user.email,
    )


@router.patch("/{org_id}/members/{user_id}", response_model=OrganizationMemberResponse)
def update_member_role(
    org_id: str,
    user_id: int,
    member_data: OrganizationMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a member's role (owner or admin only)"""
    # Check if user is owner or admin
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    is_owner = org.owner_user_id == current_user.id
    user_membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
        .first()
    )
    is_admin = user_membership and user_membership.role == MemberRole.ADMIN

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization owners and admins can update member roles",
        )

    # Get member
    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Member not found"
        )

    # Update role
    member.role = MemberRole(member_data.role)
    db.commit()
    db.refresh(member)

    # Get user details
    user = db.query(User).filter(User.id == user_id).first()

    return OrganizationMemberResponse(
        organization_id=member.organization_id,
        user_id=member.user_id,
        role=member.role.value,
        added_at=member.added_at,
        user_name=user.name if user else None,
        user_email=user.email if user else None,
    )


@router.delete("/{org_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_organization_member(
    org_id: str,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove a member from an organization (owner or admin only)"""
    # Check if user is owner or admin
    org = db.query(Organizations).filter(Organizations.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    is_owner = org.owner_user_id == current_user.id
    user_membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
        .first()
    )
    is_admin = user_membership and user_membership.role == MemberRole.ADMIN

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization owners and admins can remove members",
        )

    # Get member
    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Member not found"
        )

    # Prevent removing the owner
    if user_id == org.owner_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the organization owner",
        )

    # Remove member
    db.delete(member)
    db.commit()
    return None
