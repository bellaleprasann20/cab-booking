
import os

from celery import Celery
from celery.schedules import crontab

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "cab_booking",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.cleanup_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "daily-expired-data-cleanup": {
            "task": "app.tasks.cleanup_tasks.cleanup_expired_data",
            "schedule": crontab(hour=2, minute=0),
        },
    },
)
