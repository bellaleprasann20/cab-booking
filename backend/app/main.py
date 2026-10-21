
import logging

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.realtime import handlers  # noqa: F401
from app.realtime.socket_manager import sio
from app.utils.exceptions import register_exception_handlers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=getattr(settings, "APP_NAME", "Cab Booking Platform"),
    description="Cab booking, ride management, driver tracking, and payments API.",
    version="1.0.0",
)

# Allow the deployed frontend and local development frontends.
allowed_origins = list(
    dict.fromkeys(
        settings.cors_origins_list
        + [
            "https://cab-booking-sigma-lime.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    return {
        "success": True,
        "message": "Cab Booking Platform API is running",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "cab-booking-api",
    }


# Wrap FastAPI with Socket.IO.
socket_app = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
)
