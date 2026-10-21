import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class ReviewCreate(BaseModel):
    """rater_id comes from the token. rated_id is derived from the ride (the other party)."""

    ride_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewRead(ORMModel):
    id: uuid.UUID
    ride_id: uuid.UUID
    rater_id: uuid.UUID
    rated_id: uuid.UUID
    rating: int
    comment: str | None
    created_at: datetime


class RatingSummary(BaseModel):
    user_id: uuid.UUID
    rating_avg: float
    rating_count: int