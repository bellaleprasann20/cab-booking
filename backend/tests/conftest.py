
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_rider():
    return {
        "id": "test-rider-001",
        "name": "Test Rider",
        "email": "rider@example.com",
        "role": "rider",
    }


@pytest.fixture
def sample_driver():
    return {
        "id": "test-driver-001",
        "name": "Test Driver",
        "email": "driver@example.com",
        "role": "driver",
    }


@pytest.fixture
def sample_ride():
    return {
        "id": "test-ride-001",
        "rider_id": "test-rider-001",
        "driver_id": "test-driver-001",
        "status": "requested",
        "pickup_address": "MG Road, Bengaluru",
        "dropoff_address": "Indiranagar, Bengaluru",
        "distance_km": 5.0,
    }
