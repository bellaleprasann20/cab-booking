
import jwt

from app.core.config import settings
from app.realtime.socket_manager import (
    sio,
    emit_to_driver,
)


@sio.event
async def connect(sid, environ, auth):
    if not isinstance(auth, dict):
        return False

    token = auth.get("token")
    if not isinstance(token, str) or not token:
        return False

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
    except jwt.InvalidTokenError:
        return False

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or role not in {"rider", "driver", "admin"}:
        return False

    user_id = str(user_id)

    await sio.save_session(
        sid,
        {
            "user_id": user_id,
            "role": role,
        },
    )

    if role in {"rider", "driver"}:
        from app.realtime.socket_manager import join_user_room

        await join_user_room(sid, user_id, role)

    return True


@sio.event
async def disconnect(sid, reason=None):
    # Socket.IO automatically removes a disconnected socket from its rooms.
    # Do not mark a driver offline based on one socket disconnect alone:
    # they may have another active connection.
    pass


@sio.on("driver_heartbeat")
async def driver_heartbeat(sid, data=None):
    session = await sio.get_session(sid)

    if session.get("role") != "driver":
        return {"ok": False, "error": "Driver access required"}

    return {"ok": True}


@sio.on("driver_location_update")
async def driver_location_update(sid, data):
    session = await sio.get_session(sid)

    if session.get("role") != "driver":
        return {"ok": False, "error": "Driver access required"}

    if not isinstance(data, dict):
        return {"ok": False, "error": "Invalid payload"}

    try:
        latitude = float(data["latitude"])
        longitude = float(data["longitude"])
    except (KeyError, TypeError, ValueError):
        return {
            "ok": False,
            "error": "Latitude and longitude are required",
        }

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return {"ok": False, "error": "Coordinates are out of range"}

    # TODO:
    # 1. Persist the latest driver location.
    # 2. Load and verify the driver's active ride from the database.
    # 3. Broadcast to that ride's authorized room only.
    # 4. Apply location update throttling.

    await emit_to_driver(
        session["user_id"],
        "location_received",
        {
            "latitude": latitude,
            "longitude": longitude,
        },
    )

    return {"ok": True, "message": "Location received"}
