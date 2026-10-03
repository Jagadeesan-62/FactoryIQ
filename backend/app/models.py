"""
models.py — SQLAlchemy ORM models.
"""

import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    industry: Mapped[str] = mapped_column(String(50), default="🚗 Automotive", server_default="🚗 Automotive", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

    predictions: Mapped[list["PredictionHistory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # Inputs (stored individually for easy querying/filtering)
    production_time: Mapped[float] = mapped_column(Float)
    machine_utilization: Mapped[float] = mapped_column(Float)
    energy_consumption: Mapped[float] = mapped_column(Float)
    material_usage: Mapped[float] = mapped_column(Float)
    downtime: Mapped[float] = mapped_column(Float)
    worker_count: Mapped[float] = mapped_column(Float)
    defect_rate: Mapped[float] = mapped_column(Float)
    maintenance_frequency: Mapped[float] = mapped_column(Float)
    inventory_level: Mapped[float] = mapped_column(Float)

    # Outputs
    prediction: Mapped[str] = mapped_column(String(20))
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    report: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True
    )

    user: Mapped["User"] = relationship(back_populates="predictions")
