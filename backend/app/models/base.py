from datetime import datetime, timezone
from typing import Any

from geoalchemy2.elements import WKTElement
from sqlalchemy import Column, DateTime
from sqlmodel import Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def created_at_field() -> Any:
    return Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


def updated_at_field() -> Any:
    return Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=utcnow),
    )


def optional_datetime_field() -> Any:
    return Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )


def make_point(lat: float, lng: float) -> WKTElement:
    """Build a PostGIS point. NOTE: PostGIS order is (lng, lat), not (lat, lng)."""
    return WKTElement(f"POINT({lng} {lat})", srid=4326)