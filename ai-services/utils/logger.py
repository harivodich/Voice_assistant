import os
import sys
import logging
from pythonjsonlogger import jsonlogger

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
SERVICE_NAME = os.getenv("SERVICE_NAME", "voice-assistant")

logger = logging.getLogger(SERVICE_NAME)

if not logger.handlers:
    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    console_handler = logging.StreamHandler(sys.stdout)

    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )

    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.propagate = False


def get_logger(name=None):
    return logger.getChild(name) if name else logger