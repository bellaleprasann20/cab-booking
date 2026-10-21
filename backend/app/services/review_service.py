
def validate_review(rating: int, comment: str | None = None) -> dict:
    if not 1 <= rating <= 5:
        raise ValueError("Rating must be between 1 and 5.")

    cleaned_comment = (comment or "").strip()

    if len(cleaned_comment) > 1000:
        raise ValueError("Review comment cannot exceed 1000 characters.")

    return {
        "rating": rating,
        "comment": cleaned_comment or None,
    }
