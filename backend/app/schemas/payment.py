import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.payment import PaymentMethod, PaymentStatus
from app.schemas.common import Money, ORMModel


class PaymentIntentCreate(BaseModel):
    """The amount is read from the ride on the server, never trusted from the client."""

    ride_id: uuid.UUID


class PaymentIntentResponse(BaseModel):
    client_secret: str  # given to Stripe.js on the frontend
    payment_intent_id: str
    amount: Money
    currency: str


class PaymentRead(ORMModel):
    id: uuid.UUID
    ride_id: uuid.UUID
    method: PaymentMethod
    stripe_payment_intent_id: str | None
    amount: Money
    currency: str
    status: PaymentStatus
    created_at: datetime