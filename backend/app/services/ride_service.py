
RIDE_TRANSITIONS = {
    "requested": {"accepted", "cancelled"},
    "accepted": {"arriving", "cancelled"},
    "arriving": {"in_progress", "cancelled"},
    "in_progress": {"completed"},
    "completed": set(),
    "cancelled": set(),
}


def validate_ride_transition(current_status: str, new_status: str) -> None:
    allowed = RIDE_TRANSITIONS.get(current_status)

    if allowed is None:
        raise ValueError(f"Unknown ride status: {current_status}")

    if new_status not in allowed:
        raise ValueError(
            f"Cannot change ride from '{current_status}' to '{new_status}'."
        )


def build_ride_summary(ride) -> dict:
    """Build a summary from a ride object with the expected attributes."""
    return {
        "id": str(ride.id),
        "status": ride.status,
        "fare": str(ride.fare),
    }
