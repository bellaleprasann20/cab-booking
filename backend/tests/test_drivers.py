
from app.services.matching_service import rank_drivers_by_distance


def test_driver_fixture_has_driver_role(sample_driver):
    assert sample_driver["role"] == "driver"
    assert sample_driver["id"]


def test_driver_factory_data_shape(sample_driver):
    assert "email" in sample_driver
    assert "id" in sample_driver


def test_matching_service_returns_a_list():
    drivers = [
        {
            "id": "driver-1",
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
        {
            "id": "driver-2",
            "latitude": 12.9352,
            "longitude": 77.6245,
        },
    ]

    ranked = rank_drivers_by_distance(
        pickup_latitude=12.9716,
        pickup_longitude=77.5946,
        drivers=drivers,
    )

    assert isinstance(ranked, list)
    assert ranked
