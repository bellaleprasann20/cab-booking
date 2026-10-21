
from app.utils.validators import validate_email, validate_phone


def test_valid_email():
    assert validate_email("Rider@example.com") == "rider@example.com"


def test_invalid_email():
    import pytest

    with pytest.raises(ValueError):
        validate_email("not-an-email")


def test_valid_international_phone():
    assert validate_phone("+919876543210") == "+919876543210"


def test_invalid_phone():
    import pytest

    with pytest.raises(ValueError):
        validate_phone("12345")


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
