import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.promo import DiscountType
from app.schemas.common import Money, ORMModel


class PromoCreate(BaseModel):
    """Admin only."""

    code: str = Field(min_length=3, max_length=40)
    discount_type: DiscountType = DiscountType.percent
    discount_value: Money = Field(gt=0)
    max_discount: Money | None = Field(default=None, gt=0)
    min_fare: Money = Field(default=0, ge=0)
    usage_limit: int | None = Field(default=None, gt=0)
    per_user_limit: int = Field(default=1, gt=0)
    valid_from: datetime | None = None
    valid_until: datetime | None = None

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not v.isalnum():
            raise ValueError("Promo code must be letters and numbers only")
        return v

    @model_validator(mode="after")
    def check_rules(self):
        if self.discount_type == DiscountType.percent and self.discount_value > 100:
            raise ValueError("Percent discount cannot exceed 100")
        if self.valid_from and self.valid_until and self.valid_until <= self.valid_from:
            raise ValueError("valid_until must be after valid_from")
        return self


class PromoUpdate(BaseModel):
    is_active: bool | None = None
    usage_limit: int | None = Field(default=None, gt=0)
    valid_until: datetime | None = None


class PromoRead(ORMModel):
    id: uuid.UUID
    code: str
    discount_type: DiscountType
    discount_value: Money
    max_discount: Money | None
    min_fare: Money
    usage_limit: int | None
    used_count: int
    per_user_limit: int
    valid_from: datetime | None
    valid_until: datetime | None
    is_active: bool
    created_at: datetime


class PromoValidateRequest(BaseModel):
    """Lets the frontend preview a discount before the ride is booked."""

    code: str = Field(min_length=1, max_length=40)
    fare: Money = Field(gt=0)

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        return v.strip().upper()


class PromoValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: Money
    final_fare: Money
    message: str