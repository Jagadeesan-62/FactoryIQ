"""
schemas.py — Pydantic models for request/response validation.
"""

import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- Auth ----------

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = None
    industry: str | None = "🚗 Automotive"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str | None = None
    industry: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    industry: str | None = None


# ---------- Prediction ----------

class PredictionInput(BaseModel):
    production_time: float = Field(gt=0, le=24, description="Hours")
    machine_utilization: float = Field(ge=0, le=100, description="Percent")
    energy_consumption: float = Field(gt=0, description="kWh")
    material_usage: float = Field(gt=0, description="kg")
    downtime: float = Field(ge=0, le=24, description="Hours")
    worker_count: float = Field(gt=0, description="Count")
    defect_rate: float = Field(ge=0, le=100, description="Percent")
    maintenance_frequency: float = Field(ge=0, description="Times per month")
    inventory_level: float = Field(ge=0, description="Units")

    @field_validator("downtime")
    @classmethod
    def downtime_not_exceed_production(cls, v, info):
        prod_time = info.data.get("production_time")
        if prod_time is not None and v > prod_time:
            raise ValueError("downtime cannot exceed production_time")
        return v


class PredictionResult(BaseModel):
    id: int
    prediction: str
    confidence: float | None
    report: str | None = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class HistoryItem(BaseModel):
    id: int
    prediction: str
    confidence: float | None
    machine_utilization: float
    defect_rate: float
    downtime: float
    created_at: datetime.datetime
    has_report: bool

    model_config = {"from_attributes": True}


# ---------- Report ----------

class ReportRequest(BaseModel):
    prediction_id: int | None = Field(
        default=None,
        description="History record to report on. Defaults to the user's most recent prediction.",
    )


class ReportResponse(BaseModel):
    prediction_id: int
    report: str
    source: str  # "gemini" or "fallback"


# ---------- Chat ----------

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    source: str  # "gemini" or "fallback"
