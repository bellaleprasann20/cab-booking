import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from geoalchemy2 import Geometry
from sqlalchemy import Column, Index
from sqlmodel import Field, SQLModel

from app.models.base import created_at_field, optional_datetime_field, updated_at_field


class DriverStatus(str, Enum):
    offline = "offline"
    active = "active"
    on_ride = "on_ride"


class Driver(SQLModel, table=True):
    __tablename__ = "drivers"
    # Explicit GiST index for fast nearest-driver queries (ST_DWithin / <->)
    __table_args__ = (
        Index("ix_drivers_current_location", "current_location", postgresql_using="gist"),
    )

    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)

    vehicle_make: str = Field(max_length=60)
    vehicle_model: str = Field(max_length=60)
    vehicle_color: Optional[str] = Field(default=None, max_length=30)
    vehicle_plate: str = Field(unique=True, max_length=20)
    license_number: Optional[str] = Field(default=None, max_length=50)

    verified: bool = Field(default=False, index=True)
    status: DriverStatus = Field(default=DriverStatus.offline, index=True)

    # geometry(Point, 4326): lon/lat
    current_location: Optional[Any] = Field(
        default=None,
        sa_column=Column(Geometry("POINT", srid=4326, spatial_index=False)),
    )
    location_updated_at: Optional[datetime] = optional_datetime_field()

    created_at: datetime = created_at_field()
    updated_at: datetime = updated_at_field()