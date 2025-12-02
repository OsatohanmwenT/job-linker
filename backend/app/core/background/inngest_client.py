# app/core/background/inngest_client.py
import logging

from inngest import Inngest
from app.config import settings

logger = logging.getLogger("uvicorn")

INNGEST_BASE_URL = settings.INNGEST_BASE_URL
INNGEST_EVENT_KEY = settings.INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY = settings.INNGEST_SIGNING_KEY

if INNGEST_BASE_URL:
    logger.info(
        f"Inngest BASE_URL set to {INNGEST_BASE_URL} (dev mode if running local dev server)"
    )
else:
    logger.info("Inngest in Cloud/default mode (no INNGEST_BASE_URL set)")

# Configure Inngest client
# For local development without event key, we need to explicitly set it
inngest_client = Inngest(
    app_id="joblinker-api",
    event_key=INNGEST_EVENT_KEY,  # Can be None for dev mode
    signing_key=INNGEST_SIGNING_KEY,  # Can be None for dev mode
    logger=logger,
    is_production=False if INNGEST_BASE_URL else True,  # Auto-detect based on base URL
)

logger.info(f"Inngest client initialized (production mode: {not INNGEST_BASE_URL})")