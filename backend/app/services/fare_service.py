
from decimal import Decimal, ROUND_HALF_UP


BASE_FARE = Decimal("50.00")
PER_KM_RATE = Decimal("15.00")
PER_MINUTE_RATE = Decimal("2.00")
MINIMUM_FARE = Decimal("70.00")


def calculate_fare(
    distance_km: float,
    duration_minutes: float,
    surge_multiplier: float = 1.0,
) -> Decimal:
    if distance_km < 0 or duration_minutes < 0:
        raise ValueError("Distance and duration cannot be negative.")

    if not 1.0 <= surge_multiplier <= 3.0:
        raise ValueError("Surge multiplier must be between 1.0 and 3.0.")

    fare = (
        BASE_FARE
        + Decimal(str(distance_km)) * PER_KM_RATE
        + Decimal(str(duration_minutes)) * PER_MINUTE_RATE
    )

    fare = max(fare, MINIMUM_FARE)
    fare *= Decimal(str(surge_multiplier))

    return fare.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
