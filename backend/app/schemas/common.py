from decimal import Decimal
from typing import Annotated, Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer

# Decimal in Python, plain number in JSON (Pydantic v2 would send "12.50" as a string)
Money = Annotated[
    Decimal,
    PlainSerializer(lambda v: float(v), return_type=float, when_used="json"),
]


class ORMModel(BaseModel):
    """Base for schemas built straight from SQLModel rows."""

    model_config = ConfigDict(from_attributes=True)


class LatLng(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class Message(BaseModel):
    message: str


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int


def point_to_latlng(point: Any) -> LatLng | None:
    """Convert a PostGIS point column value into LatLng (PostGIS stores lng first)."""
    if point is None:
        return None
    from geoalchemy2.shape import to_shape

    shape = to_shape(point)
    return LatLng(lat=shape.y, lng=shape.x)