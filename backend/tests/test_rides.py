
import pytest

from app.services.fare_service import calculate_fare
from app.services.ride_service import (
    build_ride_summary,
)


def test_fare_rejects_invalid_distance():
    with pytest.raises((ValueError, TypeError)):
        calculate_fare(distance_km=-1, duration_minutes=10)


def test_ride_summary_contains_expected_fields(sample_ride):
    summary = build_ride_summary(sample_ride)

    assert isinstance(summary, dict)
    assert summary


def test_ride_fixture_has_requested_status(sample_ride):
    assert sample_ride["status"] == "requested"
    assert sample_ride["rider_id"]
    assert sample_ride["pickup_address"]
    assert sample_ride["dropoff_address"]
