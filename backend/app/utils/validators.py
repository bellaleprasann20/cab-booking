
import math
import re
from decimal import Decimal, InvalidOperation
from typing import Any


EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$"
)

PHONE_PATTERN = re.compile(r"^\+[1-9]\d{7,14}$")


def validate_email(email: str) -> str:
    """Validate a basic email format and return its normalized value."""
    if not isinstance(email, str):
        raise ValueError("Email must be a string")

    email = email.strip()

    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        raise ValueError("Enter a valid email address")

    return email.lower()


def validate_phone(phone: str) -> str:
    """Validate an international phone number in E.164 format."""
    if not isinstance(phone, str):
        raise ValueError("Phone number must be a string")

    phone = phone.strip()

    if not PHONE_PATTERN.fullmatch(phone):
        raise ValueError(
            "Phone number must use international format, "
            "for example +919876543210"
        )

    return phone


def validate_coordinates(
    latitude: Any,
    longitude: Any,
) -> tuple[float, float]:
    """Validate latitude and longitude ranges."""
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError, OverflowError):
        raise ValueError("Latitude and longitude must be numeric") from None

    if not math.isfinite(lat) or not math.isfinite(lon):
        raise ValueError("Coordinates must be finite numbers")

    if not -90 <= lat <= 90:
        raise ValueError("Latitude must be between -90 and 90")

    if not -180 <= lon <= 180:
        raise ValueError("Longitude must be between -180 and 180")

    return lat, lon


def validate_rating(rating: Any) -> int:
    """Validate a whole-number review rating from 1 to 5."""
    if isinstance(rating, bool):
        raise ValueError("Rating must be a whole number from 1 to 5")

    if isinstance(rating, float) and not rating.is_integer():
        raise ValueError("Rating must be a whole number from 1 to 5")

    try:
        value = int(rating)
    except (TypeError, ValueError, OverflowError):
        raise ValueError("Rating must be a whole number from 1 to 5") from None

    if not 1 <= value <= 5:
        raise ValueError("Rating must be between 1 and 5")

    return value


def validate_positive_amount(
    amount: Any,
    *,
    allow_zero: bool = False,
) -> Decimal:
    """Validate a finite monetary amount using Decimal."""
    if isinstance(amount, bool):
        raise ValueError("Amount must be a valid monetary value")

    try:
        value = Decimal(str(amount))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Amount must be a valid monetary value") from None

    if not value.is_finite():
        raise ValueError("Amount must be finite")

    if value < 0 or (value == 0 and not allow_zero):
        raise ValueError(
            "Amount must be greater than zero"
            if not allow_zero
            else "Amount cannot be negative"
        )

    return value


def validate_text(
    value: str,
    *,
    field_name: str = "Value",
    min_length: int = 1,
    max_length: int = 255,
) -> str:
    """Validate and normalize a non-empty text value."""
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    normalized = value.strip()

    if len(normalized) < min_length:
        raise ValueError(
            f"{field_name} must contain at least {min_length} characters"
        )

    if len(normalized) > max_length:
        raise ValueError(
            f"{field_name} cannot exceed {max_length} characters"
        )

    return normalized
