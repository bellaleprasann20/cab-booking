
import socketio

from app.core.config import settings


frontend_url = getattr(
    settings,
    "FRONTEND_URL",
    "http://localhost:5173",
)

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[frontend_url],
    logger=False,
    engineio_logger=False,
)

# Room naming conventions
def rider_room(rider_id: str) -> str:
    return f"rider:{rider_id}"


def driver_room(driver_id: str) -> str:
    return f"driver:{driver_id}"


def ride_room(ride_id: str) -> str:
    return f"ride:{ride_id}"


async def join_user_room(sid: str, user_id: str, role: str) -> None:
    if role == "rider":
        await sio.enter_room(sid, rider_room(user_id))
    elif role == "driver":
        await sio.enter_room(sid, driver_room(user_id))


async def emit_to_rider(rider_id: str, event: str, data: dict) -> None:
    await sio.emit(event, data, room=rider_room(rider_id))


async def emit_to_driver(driver_id: str, event: str, data: dict) -> None:
    await sio.emit(event, data, room=driver_room(driver_id))


async def emit_to_ride(ride_id: str, event: str, data: dict) -> None:
    """Call only after authorizing the ride's participants."""
    await sio.emit(event, data, room=ride_room(ride_id))


async def emit_ride_status(
    ride_id: str,
    status: str,
    message: str | None = None,
) -> None:
    payload = {
        "ride_id": ride_id,
        "status": status,
        "message": message,
    }
    await emit_to_ride(ride_id, "ride_status", payload)


async def emit_driver_location(
    ride_id: str,
    driver_id: str,
    latitude: float,
    longitude: float,
) -> None:
    """Publish a location only to an authorized ride room."""
    await emit_to_ride(
        ride_id,
        "driver_location",
        {
            "ride_id": ride_id,
            "driver_id": driver_id,
            "latitude": latitude,
            "longitude": longitude,
        },
    )


async def emit_ride_request(
    driver_id: str,
    ride_data: dict,
) -> None:
    await emit_to_driver(driver_id, "ride_request", ride_data)
