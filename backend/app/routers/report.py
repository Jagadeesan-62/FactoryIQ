"""
routers/report.py — POST /generate-report
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.groq_client import generate_report
from app.models import PredictionHistory, User
from app.schemas import ReportRequest, ReportResponse
from app.pdf_generator import generate_pdf_report

logger = logging.getLogger("routers.report")
router = APIRouter(tags=["report"])

INPUT_FIELDS = [
    "production_time", "machine_utilization", "energy_consumption",
    "material_usage", "downtime", "worker_count", "defect_rate",
    "maintenance_frequency", "inventory_level",
]


@router.post("/generate-report", response_model=ReportResponse)
def generate_report_endpoint(
    payload: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id)

    if payload.prediction_id is not None:
        record = query.filter(PredictionHistory.id == payload.prediction_id).first()
    else:
        record = query.order_by(PredictionHistory.created_at.desc()).first()

    if record is None:
        raise HTTPException(status_code=404, detail="No prediction found to report on")

    inputs = {field: getattr(record, field) for field in INPUT_FIELDS}
    report_text, source = generate_report(inputs, record.prediction, record.confidence, industry=current_user.industry)

    record.report = report_text
    db.commit()

    logger.info("Generated report (%s) for prediction #%d", source, record.id)
    return ReportResponse(prediction_id=record.id, report=report_text, source=source)


@router.get("/reports/{prediction_id}/pdf")
def export_pdf_report(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .filter(PredictionHistory.id == prediction_id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Prediction record not found")

    # If the text report hasn't been generated yet, generate it now
    if not record.report:
        inputs = {field: getattr(record, field) for field in INPUT_FIELDS}
        report_text, _ = generate_report(inputs, record.prediction, record.confidence, industry=current_user.industry)
        record.report = report_text
        db.commit()

    pdf_buffer = generate_pdf_report(record)
    filename = f"FactoryIQ_AI_Report_{prediction_id}.pdf"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    logger.info("Exported PDF report for prediction #%d", record.id)
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
