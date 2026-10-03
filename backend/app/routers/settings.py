"""
routers/settings.py — POST /settings/gemini-key

Allows authenticated users to set/update the Gemini API key at runtime
without restarting the server. The key is written to the .env file and the
settings cache is invalidated so subsequent Gemini calls pick up the new key.
"""

import logging
import os
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.deps import get_current_user
from app.models import User

logger = logging.getLogger("routers.settings")
router = APIRouter(tags=["settings"])

ENV_FILE = os.path.join(os.path.dirname(__file__), "..", "..", ".env")


class GeminiKeyRequest(BaseModel):
    api_key: str


class GeminiKeyResponse(BaseModel):
    status: str
    message: str
    key_preview: str  # show only first 10 chars for confirmation


def _update_env_file(key: str, value: str):
    """Write or update a KEY=VALUE pair in the .env file."""
    env_path = os.path.abspath(ENV_FILE)
    content = ""
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()

    pattern = re.compile(rf"^{re.escape(key)}=.*$", re.MULTILINE)
    new_line = f"{key}={value}"

    if pattern.search(content):
        content = pattern.sub(new_line, content)
    else:
        content = content.rstrip("\n") + f"\n{new_line}\n"

    with open(env_path, "w", encoding="utf-8") as f:
        f.write(content)


@router.post("/settings/gemini-key", response_model=GeminiKeyResponse)
def set_gemini_key(
    payload: GeminiKeyRequest,
    current_user: User = Depends(get_current_user),
):
    api_key = payload.api_key.strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")

    # Basic sanity check — Gemini keys start with "AIza"
    if not api_key.startswith("AIza") and len(api_key) < 20:
        raise HTTPException(
            status_code=400,
            detail="The key doesn't look like a valid Google API key. "
                   "It should start with 'AIza' and be at least 20 characters long.",
        )

    try:
        _update_env_file("GEMINI_API_KEY", api_key)

        # Invalidate the settings LRU cache so the new key is picked up immediately
        get_settings.cache_clear()

        # Update os.environ so that any process-wide libraries pick it up
        os.environ["GEMINI_API_KEY"] = api_key

        # Also mutate the live settings object so in-process code sees it right away
        live_settings = get_settings()
        live_settings.GEMINI_API_KEY = api_key

    except Exception as exc:
        logger.error("Failed to persist Gemini API key: %s", exc)
        raise HTTPException(status_code=500, detail=f"Failed to save API key: {exc}")

    preview = api_key[:10] + "..." if len(api_key) > 10 else api_key
    logger.info("Gemini API key updated by user %s (preview: %s)", current_user.username, preview)

    return GeminiKeyResponse(
        status="success",
        message="Gemini API key updated successfully. AI-powered features are now active.",
        key_preview=preview,
    )


@router.get("/settings/gemini-key/status", tags=["settings"])
def get_gemini_key_status(current_user: User = Depends(get_current_user)):
    """Returns whether a Gemini API key is currently configured."""
    settings = get_settings()
    has_key = bool(settings.GEMINI_API_KEY)
    preview = None
    if has_key:
        k = settings.GEMINI_API_KEY
        preview = k[:10] + "..." if len(k) > 10 else k
    return {
        "has_key": has_key,
        "key_preview": preview,
        "model": settings.GEMINI_MODEL,
    }
