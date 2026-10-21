import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, updated_at_field


class PaymentMethod(str, Enum):
    card = "card"
    wallet = "wallet"
    cash = "cash"


class PaymentStatus(str, Enum):
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    ride_id: uuid.UUID = Field(foreign_key="rides.id", index=True)
    method: PaymentMethod = Field(default=PaymentMethod.card)
    # Null for wallet/cash payments
    stripe_payment_intent_id: Optional[str] = Field(
        default=None, unique=True, index=True, max_length=255
    )
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    currency: str = Field(default="inr", max_length=3)
    status: PaymentStatus = Field(default=PaymentStatus.pending, index=True)
    created_at: datetime = created_at_field()
    updated_at: datetime = updated_at_field()