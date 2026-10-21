import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import CheckConstraint
from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, updated_at_field


class TransactionType(str, Enum):
    topup = "topup"
    ride_payment = "ride_payment"
    refund = "refund"
    adjustment = "adjustment"


class Wallet(SQLModel, table=True):
    __tablename__ = "wallets"
    __table_args__ = (
        CheckConstraint("balance >= 0", name="ck_wallets_balance_non_negative"),
    )

    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)
    balance: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    updated_at: datetime = updated_at_field()


class WalletTransaction(SQLModel, table=True):
    __tablename__ = "wallet_transactions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="wallets.user_id", index=True)
    type: TransactionType
    # Positive = money in, negative = money out
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    balance_after: Decimal = Field(max_digits=10, decimal_places=2)
    ride_id: Optional[uuid.UUID] = Field(default=None, foreign_key="rides.id")
    stripe_payment_intent_id: Optional[str] = Field(
        default=None, unique=True, max_length=255
    )
    created_at: datetime = created_at_field()