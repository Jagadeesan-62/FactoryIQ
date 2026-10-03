"""
routers/history.py — GET /history
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import PredictionHistory, User
from app.schemas import HistoryItem, PredictionResult

logger = logging.getLogger("routers.history")
router = APIRouter(tags=["history"])


@router.get("/history", response_model=list[HistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
):
    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(min(limit, 200))
        .all()
    )
    return [
        HistoryItem(
            id=r.id,
            prediction=r.prediction,
            confidence=r.confidence,
            machine_utilization=r.machine_utilization,
            defect_rate=r.defect_rate,
            downtime=r.downtime,
            created_at=r.created_at,
            has_report=bool(r.report),
        )
        for r in records
    ]


@router.get("/history/{record_id}", response_model=PredictionResult)
def get_history_detail(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the full prediction record including all input fields."""
    record = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.id == record_id,
            PredictionHistory.user_id == current_user.id,
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return record
