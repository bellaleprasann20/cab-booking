import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, updated_at_field


# Member names match their values so Postgres stores 'rider', not 'RIDER'
class UserRole(str, Enum):
    rider = "rider"
    driver = "driver"
    admin = "admin"


class User(SQLModel, table=True):
    __tablename__ = "users"  # "user" is a reserved word in Postgres

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    auth_id: str = Field(unique=True, index=True, max_length=255)  # Clerk/Supabase `sub`
    name: str = Field(max_length=120)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    role: UserRole = Field(default=UserRole.rider, index=True)
    profile_pic: Optional[str] = Field(default=None, max_length=500)
    rating_avg: float = Field(default=0.0)
    rating_count: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = created_at_field()
    updated_at: datetime = updated_at_field()