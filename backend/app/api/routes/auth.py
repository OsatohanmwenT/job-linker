import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.config import settings
from app.db import get_db
from app.models import RefreshToken, User
from app.schemas import LoginRequest, RegisterRequest, UserResponse
from app.schemas.refresh_token import RefreshTokenRequest, TokenResponse
from app.utils import create_access_token, hash_password, verify_password
from app.utils.jwt import create_refresh_token, hash_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(request.password)
    new_user = User(
        email=request.email,
        name=request.name,
        hashed_password=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "name": new_user.name}
    )

    # Create refresh token
    refresh_token_str = create_refresh_token()
    refresh_token = RefreshToken(
        user_id=new_user.id,
        token_hash=hash_token(refresh_token_str),
        expires_at=dt.datetime.now(dt.UTC)
        + dt.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token)
    db.commit()

    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=user_response,
    )


@router.post("/login", response_model=TokenResponse, response_model_by_alias=True)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id), "name": user.name})

    # Create refresh token
    refresh_token_str = create_refresh_token()
    refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token_str),
        expires_at=dt.datetime.now(dt.UTC)
        + dt.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token)
    db.commit()

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=user_response,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """Get current authenticated user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
    )


@router.post("/refresh", response_model=TokenResponse, response_model_by_alias=True)
async def refresh_access_token(
    request: RefreshTokenRequest, db: Session = Depends(get_db)
):
    """Exchange refresh token for new access and refresh tokens"""
    token_hash_value = hash_token(request.refresh_token)

    # Find the refresh token
    refresh_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash_value)
        .first()
    )

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Check if token is revoked
    if refresh_token.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    # Check if token is expired
    current_time = dt.datetime.now(dt.UTC)
    # Ensure both datetimes are timezone-aware for comparison
    token_expires_at = refresh_token.expires_at
    if token_expires_at.tzinfo is None:
        # If stored datetime is naive, make it UTC-aware
        token_expires_at = token_expires_at.replace(tzinfo=dt.UTC)

    if token_expires_at < current_time:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    # Get user
    user = db.query(User).filter(User.id == refresh_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Revoke old refresh token (token rotation for security)
    refresh_token.is_revoked = True

    # Create new access token
    new_access_token = create_access_token(
        data={"sub": str(user.id), "name": user.name}
    )

    # Create new refresh token
    new_refresh_token_str = create_refresh_token()
    new_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh_token_str),
        expires_at=dt.datetime.now(dt.UTC)
        + dt.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_refresh_token)
    db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token_str,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Logout user by revoking refresh token"""
    token_hash_value = hash_token(request.refresh_token)

    # Find and revoke the refresh token
    refresh_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash_value,
            RefreshToken.user_id == current_user.id,
        )
        .first()
    )

    if refresh_token:
        refresh_token.is_revoked = True
        db.commit()

    return None
