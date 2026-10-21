import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.driver import DriverStatus
from app.schemas.common import LatLng, ORMModel, point_to_latlng


class DriverCreate(BaseModel):
    """Driver onboarding (user must already exist with role=driver)."""

    vehicle_make: str = Field(min_length=1, max_length=60)
    vehicle_model: str = Field(min_length=1, max_length=60)
    vehicle_color: str | None = Field(default=None, max_length=30)
    vehicle_plate: str = Field(min_length=3, max_length=20)
    license_number: str | None = Field(default=None, max_length=50)

    @field_validator("vehicle_plate")
    @classmethod
    def normalize_plate(cls, v: str) -> str:
        return v.replace(" ", "").replace("-", "").upper()


class DriverUpdate(BaseModel):
    vehicle_make: str | None = Field(default=None, max_length=60)
    vehicle_model: str | None = Field(default=None, max_length=60)
    vehicle_color: str | None = Field(default=None, max_length=30)
    license_number: str | None = Field(default=None, max_length=50)


class DriverStatusUpdate(BaseModel):
    # on_ride is set by the system when a ride is accepted, never by the client
    status: Literal[DriverStatus.offline, DriverStatus.active]


class LocationUpdate(LatLng):
    heading: float | None = Field(default=None, ge=0, le=360)


class DriverRead(ORMModel):
    user_id: uuid.UUID
    vehicle_make: str
    vehicle_model: str
    vehicle_color: str | None
    vehicle_plate: str
    license_number: str | None
    verified: bool
    status: DriverStatus
    location_updated_at: datetime | None
    created_at: datetime

    @classmethod
    def from_driver(cls, driver) -> "DriverRead":
        return cls.model_validate(driver)


class DriverPublic(BaseModel):
    """What a rider sees about their driver (no license number)."""

    user_id: uuid.UUID
    name: str
    profile_pic: str | None = None
    rating_avg: float
    vehicle_make: str
    vehicle_model: str
    vehicle_color: str | None = None
    vehicle_plate: str
    location: LatLng | None = None

    @classmethod
    def from_rows(cls, user, driver) -> "DriverPublic":
        return cls(
            user_id=driver.user_id,
            name=user.name,
            profile_pic=user.profile_pic,
            rating_avg=user.rating_avg,
            vehicle_make=driver.vehicle_make,
            vehicle_model=driver.vehicle_model,
            vehicle_color=driver.vehicle_color,
            vehicle_plate=driver.vehicle_plate,
            location=point_to_latlng(driver.current_location),
        )


class NearbyDriver(BaseModel):
    """One row from the PostGIS nearest-driver query."""

    user_id: uuid.UUID
    name: str
    rating_avg: float
    vehicle_make: str
    vehicle_model: str
    vehicle_plate: str
    location: LatLng
    distance_meters: float