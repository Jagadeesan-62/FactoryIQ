"""
predict.py — loads the trained model once and exposes a predict() function
that accepts a JSON-style dict of the 9 manufacturing features and returns
the predicted efficiency category with a confidence score.

This is the module the FastAPI backend (Phase 2) will import directly —
it loads the model artifacts a single time at import, not per-request.

CLI usage:
    python predict.py '{"production_time": 8.5, "machine_utilization": 82, ...}'
"""

from __future__ import annotations

import json
import logging
import os
import sys
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from preprocess import FEATURE_COLS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("predict")

BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, "models")


class PredictionError(Exception):
    """Raised when input is missing required fields or the model isn't loaded."""


class EfficiencyPredictor:
    """Loads model artifacts once and serves predictions."""

    def __init__(self, models_dir: str = MODELS_DIR):
        model_path = os.path.join(models_dir, "best_model.pkl")
        scaler_path = os.path.join(models_dir, "scaler.pkl")
        encoder_path = os.path.join(models_dir, "encoder.pkl")

        for path in (model_path, scaler_path, encoder_path):
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Missing artifact: {path}. Run train.py first."
                )

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.encoder = joblib.load(encoder_path)
        logger.info("Loaded model artifacts from %s", models_dir)

    def predict(self, record: Dict[str, Any]) -> Dict[str, Any]:
        missing = [c for c in FEATURE_COLS if c not in record]
        if missing:
            raise PredictionError(f"Missing required fields: {missing}")

        try:
            row = pd.DataFrame([{c: float(record[c]) for c in FEATURE_COLS}])
        except (TypeError, ValueError) as exc:
            raise PredictionError(f"Non-numeric value in input: {exc}") from exc

        scaled = self.scaler.transform(row)
        pred_idx = self.model.predict(scaled)[0]
        label = self.encoder.inverse_transform([pred_idx])[0]

        if hasattr(self.model, "predict_proba"):
            proba = self.model.predict_proba(scaled)[0]
            confidence = round(float(np.max(proba)) * 100, 2)
        else:
            confidence = None

        return {"prediction": label, "confidence": confidence}


# Module-level singleton so the backend only loads the model once.
_predictor: EfficiencyPredictor | None = None


def get_predictor() -> EfficiencyPredictor:
    global _predictor
    if _predictor is None:
        _predictor = EfficiencyPredictor()
    return _predictor


def predict(record: Dict[str, Any]) -> Dict[str, Any]:
    return get_predictor().predict(record)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        payload = json.loads(sys.argv[1])
    else:
        # sample record for a quick smoke test
        payload = {
            "production_time": 9.2,
            "machine_utilization": 91,
            "energy_consumption": 410,
            "material_usage": 280,
            "downtime": 0.8,
            "worker_count": 40,
            "defect_rate": 1.1,
            "maintenance_frequency": 6,
            "inventory_level": 450,
        }
    result = predict(payload)
    print(json.dumps(result, indent=2))
