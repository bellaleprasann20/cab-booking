import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, optional_datetime_field


class DiscountType(str, Enum):
    percent = "percent"
    flat = "flat"


class Promo(SQLModel, table=True):
    __tablename__ = "promos"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(unique=True, index=True, max_length=40)  # store uppercase
    discount_type: DiscountType = Field(default=DiscountType.percent)
    discount_value: Decimal = Field(max_digits=10, decimal_places=2)  # 10 = 10% or ₹10
    max_discount: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    min_fare: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    usage_limit: Optional[int] = Field(default=None)  # total uses, None = unlimited
    used_count: int = Field(default=0)
    per_user_limit: int = Field(default=1)
    valid_from: Optional[datetime] = optional_datetime_field()
    valid_until: Optional[datetime] = optional_datetime_field()
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = created_at_field()


class PromoRedemption(SQLModel, table=True):
    """Tracks who used which code, so per_user_limit can be enforced."""

    __tablename__ = "promo_redemptions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    promo_id: uuid.UUID = Field(foreign_key="promos.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    ride_id: uuid.UUID = Field(foreign_key="rides.id", index=True)
    created_at: datetime = created_at_field()