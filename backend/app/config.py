"""
config.py — centralized settings loaded from environment variables (.env).

Never hard-code secrets. Copy .env.example to .env and fill in real values.
"""

from functools import lru_cache
import os
from pathlib import Path
from dotenv import load_dotenv

from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env file from backend/ or root
_backend_dir = Path(__file__).resolve().parent.parent
_root_dir = _backend_dir.parent

load_dotenv(_backend_dir / ".env")
load_dotenv(_root_dir / ".env")


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "FactoryIQ AI API"
    ENV: str = "development"

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./optimanufacture.db"

    # --- Auth / JWT ---
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # --- Groq ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # --- ML artifacts ---
    ML_DIR: str = "../ml"

    # --- CORS ---
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://arunprabu-12.github.io"

    model_config = SettingsConfigDict(
        env_file=[_backend_dir / ".env", _root_dir / ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

