
from fastapi import APIRouter

from app.api.routes import (
    auth,
    rides,
    drivers,
    payments,
    webhooks,
    reviews,
    promos,
    wallet,
    admin,
    ws,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    rides.router,
    prefix="/rides",
    tags=["Rides"],
)

api_router.include_router(
    drivers.router,
    prefix="/drivers",
    tags=["Drivers"],
)

api_router.include_router(
    payments.router,
    prefix="/payments",
    tags=["Payments"],
)

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["Webhooks"],
)

api_router.include_router(
    reviews.router,
    prefix="/reviews",
    tags=["Reviews"],
)

api_router.include_router(
    promos.router,
    prefix="/promos",
    tags=["Promotions"],
)

api_router.include_router(
    wallet.router,
    prefix="/wallet",
    tags=["Wallet"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administration"],
)

api_router.include_router(
    ws.router,
    tags=["Real-time"],
)
