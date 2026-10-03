"""
main.py — OptiManufacture FastAPI application entrypoint.

Run locally:
    uvicorn main:app --reload --port 8000

Docs:
    http://localhost:8000/docs
"""

import logging
import os
from dotenv import load_dotenv

# Load environment variables at startup
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, chat, history, predict, profile, report, simulate, settings as settings_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("main")

settings = get_settings()

# Creates tables on first run. For real production use, prefer Alembic
# migrations instead of create_all.
Base.metadata.create_all(bind=engine)

# Dynamically add the industry column if it does not exist (e.g. for pre-existing DBs)
from sqlalchemy import text
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN industry VARCHAR(50) DEFAULT '🚗 Automotive'"))
        logger.info("Database migration: added industry column to users table.")
except Exception as e:
    # Column probably exists or database schema is already up to date
    logger.debug("Database migration note: industry column might already exist: %s", e)

app = FastAPI(
    title=settings.APP_NAME,
    description="ML-powered production efficiency prediction, reporting, and chat API.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(report.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(profile.router)
app.include_router(simulate.router)
app.include_router(settings_router.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}

# Force reload config final touch

