
import pytest

from app.services.review_service import validate_review
from tests.factories import ReviewFactory


def test_review_factory_defaults():
    review = ReviewFactory()

    assert review["rating"] == 5
    assert review["comment"]
    assert review["ride_id"]


@pytest.mark.parametrize("rating", [1, 2, 3, 4, 5])
def test_valid_review_ratings(rating):
    result = validate_review(
        rating=rating,
        comment="Good ride.",
    )

    assert result is not None


@pytest.mark.parametrize("rating", [0, 6, -1])
def test_invalid_review_ratings(rating):
    with pytest.raises(ValueError):
        validate_review(
            rating=rating,
            comment="Good ride.",
        )


def test_review_comment_length_limit():
    with pytest.raises(ValueError):
        validate_review(
            rating=5,
            comment="x" * 1001,
        )
