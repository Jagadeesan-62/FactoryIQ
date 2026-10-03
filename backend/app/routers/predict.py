"""
routers/predict.py — POST /predict

Loads the trained model exactly once (via ml/predict.py's module-level
singleton) and stores every prediction in the user's history.
"""

import logging
import os
import sys

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.deps import get_current_user, get_db
from app.models import PredictionHistory, User
from app.schemas import PredictionInput, PredictionResult

logger = logging.getLogger("routers.predict")
router = APIRouter(tags=["predict"])

# Make the ml/ package importable regardless of the working directory the
# server is launched from.
_settings = get_settings()
_ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", _settings.ML_DIR))
if _ML_DIR not in sys.path:
    sys.path.insert(0, _ML_DIR)

try:
    from predict import PredictionError, predict as ml_predict  # noqa: E402
except FileNotFoundError as exc:
    # Model artifacts not trained yet — surface a clear error at request time
    # instead of crashing the whole app on import.
    ml_predict = None
    _import_error = exc
else:
    _import_error = None


@router.post("/predict", response_model=PredictionResult)
def predict(
    payload: PredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if ml_predict is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model not available: {_import_error}. Run ml/train.py first.",
        )

    try:
        result = ml_predict(payload.model_dump())
    except PredictionError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Automatically generate report (Gemini or local fallback)
    from app.groq_client import generate_report
    report_text, source = generate_report(payload.model_dump(), result["prediction"], result["confidence"])

    record = PredictionHistory(
        user_id=current_user.id,
        prediction=result["prediction"],
        confidence=result["confidence"],
        report=report_text,
        **payload.model_dump(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    logger.info("User %s -> prediction %s (%.2f%%) [report source: %s]",
                current_user.username, result["prediction"], result["confidence"] or 0, source)

    return record
