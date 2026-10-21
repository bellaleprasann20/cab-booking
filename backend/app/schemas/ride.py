import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.models.payment import PaymentMethod
from app.models.ride import RideStatus
from app.schemas.common import LatLng, Money, point_to_latlng
from app.schemas.driver import DriverPublic


class FareBreakdown(BaseModel):
    base_fare: Money
    distance_fare: Money
    time_fare: Money


class FareEstimateResponse(BaseModel):
    """GET /api/rides/estimate. The server always computes the fare; the client never sends one."""

    distance_meters: int
    duration_secs: int
    fare_estimate: Money
    currency: str
    breakdown: FareBreakdown


class RideCreate(BaseModel):
    """POST /api/rides/request. The fare is recomputed server-side on creation."""

    pickup: LatLng
    drop: LatLng
    pickup_address: str = Field(min_length=1, max_length=500)
    drop_address: str = Field(min_length=1, max_length=500)
    payment_method: PaymentMethod = PaymentMethod.card
    promo_code: str | None = Field(default=None, max_length=40)

    @model_validator(mode="after")
    def pickup_differs_from_drop(self):
        if (
            abs(self.pickup.lat - self.drop.lat) < 1e-5
            and abs(self.pickup.lng - self.drop.lng) < 1e-5
        ):
            raise ValueError("Pickup and drop locations must be different")
        return self


class RideCancel(BaseModel):
    reason: str | None = Field(default=None, max_length=300)


class RideStatusUpdate(BaseModel):
    """Driver-side transitions. accepted/cancelled have their own endpoints."""

    status: Literal[
        RideStatus.driver_arrived,
        RideStatus.in_progress,
        RideStatus.completed,
    ]


class RideRead(BaseModel):
    id: uuid.UUID
    rider_id: uuid.UUID
    driver_id: uuid.UUID | None
    pickup: LatLng
    drop: LatLng
    pickup_address: str
    drop_address: str
    status: RideStatus
    payment_method: PaymentMethod
    fare_estimate: Money
    fare_actual: Money | None
    discount_amount: Money
    distance_meters: int
    duration_secs: int
    cancel_reason: str | None
    accepted_at: datetime | None
    started_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    created_at: datetime

    @classmethod
    def from_ride(cls, ride) -> "RideRead":
        # Geometry columns need converting, so we can't use from_attributes directly
        return cls(
            id=ride.id,
            rider_id=ride.rider_id,
            driver_id=ride.driver_id,
            pickup=point_to_latlng(ride.pickup_point),
            drop=point_to_latlng(ride.drop_point),
            pickup_address=ride.pickup_address,
            drop_address=ride.drop_address,
            status=ride.status,
            payment_method=ride.payment_method,
            fare_estimate=ride.fare_estimate,
            fare_actual=ride.fare_actual,
            discount_amount=ride.discount_amount,
            distance_meters=ride.distance_meters,
            duration_secs=ride.duration_secs,
            cancel_reason=ride.cancel_reason,
            accepted_at=ride.accepted_at,
            started_at=ride.started_at,
            completed_at=ride.completed_at,
            cancelled_at=ride.cancelled_at,
            created_at=ride.created_at,
        )


class RideDetail(RideRead):
    """Ride + driver info, for the live-tracking and ride-details pages."""

    driver: DriverPublic | None = None


class RideStatusEvent(BaseModel):
    """Payload pushed over WebSocket when a ride changes state."""

    ride_id: uuid.UUID
    status: RideStatus
    driver_location: LatLng | None = None
    eta_secs: int | None = None