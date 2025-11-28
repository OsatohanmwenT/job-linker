# app/schemas/refresh_token.py
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserResponse


class RefreshTokenRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    refresh_token: str = Field(..., alias="refreshToken")


class TokenResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, by_alias=True)

    access_token: str = Field(..., serialization_alias="accessToken")
    refresh_token: str = Field(..., serialization_alias="refreshToken")
    token_type: str = Field(default="bearer", serialization_alias="tokenType")
    user: Optional[UserResponse] = None
