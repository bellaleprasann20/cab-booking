
import jwt

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings

router = APIRouter()


async def connect_user(
    websocket: WebSocket,
    user_id: str,
    expected_role: str,
):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return False

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
    except jwt.InvalidTokenError:
        await websocket.close(code=1008, reason="Invalid token")
        return False

    if str(payload.get("sub")) != str(user_id):
        await websocket.close(code=1008, reason="User mismatch")
        return False

    if payload.get("role") != expected_role:
        await websocket.close(code=1008, reason="Invalid role")
        return False

    await websocket.accept()
    return True


async def keep_connection_alive(websocket: WebSocket):
    try:
        while True:
            message = await websocket.receive_text()
            # Heartbeat/command handling will be added with the socket manager.
            if message == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass


@router.websocket("/ws/driver/{driver_id}")
async def driver_websocket(websocket: WebSocket, driver_id: str):
    if await connect_user(websocket, driver_id, "driver"):
        await keep_connection_alive(websocket)


@router.websocket("/ws/rider/{rider_id}")
async def rider_websocket(websocket: WebSocket, rider_id: str):
    if await connect_user(websocket, rider_id, "rider"):
        await keep_connection_alive(websocket)
