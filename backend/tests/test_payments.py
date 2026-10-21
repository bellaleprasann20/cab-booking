
import pytest

from app.utils.validators import validate_positive_amount
from tests.factories import PaymentFactory


def test_payment_factory_defaults():
    payment = PaymentFactory()

    assert payment["amount"] == "145.00"
    assert payment["currency"] == "INR"
    assert payment["status"] == "pending"


def test_valid_payment_amount():
    amount = validate_positive_amount("145.00")

    assert str(amount) == "145.00"


def test_zero_payment_amount_is_rejected():
    with pytest.raises(ValueError):
        validate_positive_amount("0")


def test_negative_payment_amount_is_rejected():
    with pytest.raises(ValueError):
        validate_positive_amount("-50.00")


def test_non_finite_payment_amount_is_rejected():
    with pytest.raises(ValueError):
        validate_positive_amount("NaN")
