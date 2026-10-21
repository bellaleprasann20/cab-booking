import uuid
from datetime import datetime

from pydantic import Field

from app.models.wallet import TransactionType
from app.schemas.common import BaseModel, Money, ORMModel

MAX_TOPUP = 50000
MIN_TOPUP = 10


class WalletRead(ORMModel):
    user_id: uuid.UUID
    balance: Money
    updated_at: datetime


class WalletTopUpRequest(BaseModel):
    amount: Money = Field(ge=MIN_TOPUP, le=MAX_TOPUP, decimal_places=2)


class WalletTopUpResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: Money


class WalletTransactionRead(ORMModel):
    id: uuid.UUID
    type: TransactionType
    amount: Money  # positive = money in, negative = money out
    balance_after: Money
    ride_id: uuid.UUID | None
    created_at: datetime