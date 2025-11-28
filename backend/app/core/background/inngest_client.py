# app/core/background/inngest_client.py
import logging
import os

from inngest import Inngest

logger = logging.getLogger("uvicorn")

INNGEST_BASE_URL = os.getenv("INNGEST_BASE_URL")
if INNGEST_BASE_URL:
    logger.info(
        f"Inngest BASE_URL set to {INNGEST_BASE_URL} (dev mode if running local dev server)"
    )
else:
    logger.info("Inngest in Cloud/default mode (no INNGEST_BASE_URL set)")

# Do not remove signing/event keys; let the SDK detect Cloud vs Dev based on env vars.
inngest_client = Inngest(
    app_id="joblinker-api",
    logger=logger,
)
