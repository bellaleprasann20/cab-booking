import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models.base import created_at_field


class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),
        # One review per person per ride
        UniqueConstraint("ride_id", "rater_id", name="uq_reviews_ride_rater"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    ride_id: uuid.UUID = Field(foreign_key="rides.id", index=True)
    rater_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    rated_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    rating: int
    comment: Optional[str] = Field(default=None, max_length=1000)
    created_at: datetime = created_at_field()