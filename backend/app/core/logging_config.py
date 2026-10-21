import logging
import logging.config

from app.core.config import settings


def setup_logging() -> None:
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                }
            },
            "root": {"level": settings.LOG_LEVEL, "handlers": ["console"]},
            "loggers": {
                "uvicorn.access": {"level": "WARNING"},
                "sqlalchemy.engine": {
                    "level": "INFO" if settings.DEBUG else "WARNING"
                },
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)