"""
routers/chat.py — POST /chat, using the user's latest prediction/report as context
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.groq_client import chat_reply
from app.models import PredictionHistory, User
from app.schemas import ChatRequest, ChatResponse

logger = logging.getLogger("routers.chat")
router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    latest = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .first()
    )

    context = {}
    if latest:
        context = {
            "prediction": latest.prediction,
            "confidence": latest.confidence,
            "production_time": latest.production_time,
            "machine_utilization": latest.machine_utilization,
            "energy_consumption": latest.energy_consumption,
            "material_usage": latest.material_usage,
            "downtime": latest.downtime,
            "worker_count": latest.worker_count,
            "defect_rate": latest.defect_rate,
            "maintenance_frequency": latest.maintenance_frequency,
            "inventory_level": latest.inventory_level,
            "report": latest.report,
        }

    reply_text, source = chat_reply(payload.message, context, industry=current_user.industry)
    logger.info("Chat reply (%s) for user %s", source, current_user.username)
    return ChatResponse(reply=reply_text, source=source)
