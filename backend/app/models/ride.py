import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Optional

from geoalchemy2 import Geometry
from sqlalchemy import Column
from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, optional_datetime_field, updated_at_field
from app.models.payment import PaymentMethod


class RideStatus(str, Enum):
    requested = "requested"
    accepted = "accepted"
    driver_arrived = "driver_arrived"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Ride(SQLModel, table=True):
    __tablename__ = "rides"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    rider_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    driver_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="drivers.user_id", index=True
    )

    pickup_point: Any = Field(
        sa_column=Column(Geometry("POINT", srid=4326, spatial_index=False), nullable=False)
    )
    drop_point: Any = Field(
        sa_column=Column(Geometry("POINT", srid=4326, spatial_index=False), nullable=False)
    )
    pickup_address: str = Field(max_length=500)
    drop_address: str = Field(max_length=500)

    status: RideStatus = Field(default=RideStatus.requested, index=True)
    payment_method: PaymentMethod = Field(default=PaymentMethod.card)

    fare_estimate: Decimal = Field(max_digits=10, decimal_places=2)
    fare_actual: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    discount_amount: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    promo_id: Optional[uuid.UUID] = Field(default=None, foreign_key="promos.id")

    distance_meters: int = Field(default=0)
    duration_secs: int = Field(default=0)

    cancel_reason: Optional[str] = Field(default=None, max_length=300)
    accepted_at: Optional[datetime] = optional_datetime_field()
    started_at: Optional[datetime] = optional_datetime_field()
    completed_at: Optional[datetime] = optional_datetime_field()
    cancelled_at: Optional[datetime] = optional_datetime_field()

    created_at: datetime = created_at_field()
    updated_at: datetime = updated_at_field()