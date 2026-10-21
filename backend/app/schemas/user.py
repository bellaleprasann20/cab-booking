
import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole
from app.schemas.common import ORMModel


PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def _clean_phone(v: str | None) -> str | None:
    if v is None:
        return v

    v = re.sub(r"[\s\-()]", "", v)

    if not PHONE_RE.match(v):
        raise ValueError("Invalid phone number")

    return v


class SessionCreate(BaseModel):
    """Body for POST /api/auth/session."""

    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = None
    role: UserRole = UserRole.rider
    profile_pic: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        return v

    @field_validator("role")
    @classmethod
    def no_self_service_admin(cls, v: UserRole) -> UserRole:
        if v == UserRole.admin:
            raise ValueError("Cannot sign up as admin")
        return v

    _phone = field_validator("phone")(_clean_phone)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = None
    profile_pic: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str | None) -> str | None:
        if v is None:
            return v

        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        return v

    _phone = field_validator("phone")(_clean_phone)


class UserRead(ORMModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None
    role: UserRole
    profile_pic: str | None
    rating_avg: float
    rating_count: int
    is_active: bool
    created_at: datetime


class UserPublic(ORMModel):
    """Public user information without email or phone."""

    id: uuid.UUID
    name: str
    profile_pic: str | None
    rating_avg: float
    rating_count: int


class RegisterRequest(BaseModel):
    """Request body for registering a new user."""

    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = None
    role: UserRole = UserRole.rider

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank")
        return v

    @field_validator("role")
    @classmethod
    def no_self_service_admin(cls, v: UserRole) -> UserRole:
        if v == UserRole.admin:
            raise ValueError("Cannot sign up as admin")
        return v

    _phone = field_validator("phone")(_clean_phone)


class LoginRequest(BaseModel):
    """Request body for logging in."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """Authentication response containing a bearer token and user."""

    access_token: str
    token_type: str = "bearer"
    user: UserRead
