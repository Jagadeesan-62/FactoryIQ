"""
routers/simulate.py — POST /simulate

What-If Simulator endpoint:
- Takes baseline inputs + modified inputs
- Returns predictions for both scenarios (no DB write)
- Generates a Gemini-powered "what changed and why" insight
"""

import logging
import os
import sys

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config import get_settings
from app.deps import get_current_user
from app.models import User

logger = logging.getLogger("routers.simulate")
router = APIRouter(tags=["simulate"])

# Make ml/ importable
_settings = get_settings()
_ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", _settings.ML_DIR))
if _ML_DIR not in sys.path:
    sys.path.insert(0, _ML_DIR)

try:
    from predict import PredictionError, predict as ml_predict  # noqa: E402
except FileNotFoundError as exc:
    ml_predict = None
    _import_error = exc
else:
    _import_error = None


# ---------- Schemas ----------

class SimulateInputs(BaseModel):
    production_time: float = Field(gt=0, le=24)
    machine_utilization: float = Field(ge=0, le=100)
    energy_consumption: float = Field(gt=0)
    material_usage: float = Field(gt=0)
    downtime: float = Field(ge=0, le=24)
    worker_count: float = Field(gt=0)
    defect_rate: float = Field(ge=0, le=100)
    maintenance_frequency: float = Field(ge=0)
    inventory_level: float = Field(ge=0)


class SimulateRequest(BaseModel):
    baseline: SimulateInputs
    modified: SimulateInputs


class SimulateScenario(BaseModel):
    prediction: str
    confidence: float | None
    inputs: dict


class SimulateResponse(BaseModel):
    baseline: SimulateScenario
    modified: SimulateScenario
    changed_fields: list[dict]
    insight: str
    insight_source: str


from app.industry_mapping import get_industry_mapping

# ---------- Helpers ----------

def _detect_changes(baseline: dict, modified: dict, industry: str | None = None) -> list[dict]:
    """Returns list of changed fields with before/after values."""
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    changes = []
    for key in baseline:
        bv = baseline[key]
        mv = modified[key]
        if abs(bv - mv) > 1e-6:
            changes.append({
                "field": key,
                "label": labels.get(key, key),
                "before": bv,
                "after": mv,
                "delta": mv - bv,
                "direction": "increased" if mv > bv else "decreased",
            })
    return changes


def _generate_whatif_insight(
    baseline_inputs: dict,
    baseline_pred: str,
    baseline_conf: float | None,
    modified_inputs: dict,
    modified_pred: str,
    modified_conf: float | None,
    changes: list[dict],
    industry: str | None = None,
) -> tuple[str, str]:
    """Generate a Gemini-powered What-If insight, with rule-based fallback."""
    # Short-circuit: if nothing changed, skip the Gemini API call entirely
    if not changes:
        return _fallback_whatif_insight(
            baseline_pred, modified_pred, changes,
            baseline_conf, modified_conf, industry
        ), "fallback"

    from app.groq_client import _call_groq
    mapping = get_industry_mapping(industry)

    changes_text = "\n".join(
        f"  - {c['label']}: {c['before']} → {c['after']} ({c['direction']} by {abs(c['delta']):.2f})"
        for c in changes
    )

    baseline_conf_val = baseline_conf if baseline_conf is not None else 0.0
    modified_conf_val = modified_conf if modified_conf is not None else 0.0

    prompt = f"""You are a manufacturing operations AI assistant embedded in a What-If Simulator for the {mapping['name']} industry.
{mapping['chatbot_persona']}

A user adjusted the following parameters on the {mapping['production_line_term']}:
{changes_text}

Baseline scenario:
  - Inputs: {baseline_inputs}
  - Predicted Efficiency: {baseline_pred} ({baseline_conf_val:.1f}% confidence)

Modified scenario:
  - Inputs: {modified_inputs}
  - Predicted Efficiency: {modified_pred} ({modified_conf_val:.1f}% confidence)

In 3-5 concise sentences, explain:
1. What specific parameter changes most likely drove the shift in efficiency prediction
2. Whether the change is beneficial or detrimental and why
3. One actionable recommendation based on this simulation

Be specific, data-driven, and avoid generic advice. Reference the exact numbers and labels provided.
"""

    text = _call_groq(prompt)
    if text:
        return text.strip(), "groq"

    # Rule-based fallback
    return _fallback_whatif_insight(
        baseline_pred, modified_pred, changes,
        baseline_conf, modified_conf, industry
    ), "fallback"


def _fallback_whatif_insight(
    baseline_pred: str,
    modified_pred: str,
    changes: list[dict],
    baseline_conf: float | None,
    modified_conf: float | None,
    industry: str | None = None,
) -> str:
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    if not changes:
        return (
            f"No parameter changes were detected. Both scenarios predict '{baseline_pred}' efficiency. "
            "Modify at least one parameter to observe a different outcome."
        )

    efficiency_order = {"Low": 0, "Moderate": 1, "High": 2, "Optimal": 3}
    base_rank = efficiency_order.get(baseline_pred, 1)
    mod_rank = efficiency_order.get(modified_pred, 1)

    change_labels = [c["label"] for c in changes]
    change_summary = ", ".join(change_labels[:3])

    if mod_rank > base_rank:
        trend = f"improved from '{baseline_pred}' to '{modified_pred}'"
        driver = f"These changes had a positive impact on predicted {mapping['name']} production efficiency."
        rec = f"Continue pushing these parameters toward their optimal thresholds to sustain gains on the {mapping['production_line_term']}."
    elif mod_rank < base_rank:
        trend = f"declined from '{baseline_pred}' to '{modified_pred}'"
        driver = f"These changes negatively impacted the predicted {mapping['name']} efficiency category."
        rec = f"Revert or partially restore the changed parameters to recover {mapping['name']} operational efficiency."
    else:
        trend = f"remained at '{baseline_pred}' efficiency"
        driver = f"The changes were not sufficient to shift the efficiency category for this {mapping['production_line_term']}."
        rec = f"Try larger changes in {labels['machine_utilization']} or {labels['downtime']} for a stronger impact."

    conf_note = ""
    if baseline_conf is not None and modified_conf is not None:
        conf_delta = modified_conf - baseline_conf
        if abs(conf_delta) > 2:
            conf_note = (
                f" Model confidence {'increased' if conf_delta > 0 else 'decreased'} "
                f"by {abs(conf_delta):.1f}%."
            )

    return (
        f"After adjusting {change_summary}, the predicted efficiency {trend}.{conf_note} "
        f"{driver} {rec} "
        f"[Local fallback for {mapping['name']} industry — set your GROQ_API_KEY for AI-powered insights.]"
    )


# ---------- Endpoint ----------

@router.post("/simulate", response_model=SimulateResponse)
def simulate(
    payload: SimulateRequest,
    current_user: User = Depends(get_current_user),
):
    if ml_predict is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model not available: {_import_error}. Run ml/train.py first.",
        )

    try:
        baseline_dict = payload.baseline.model_dump()
        modified_dict = payload.modified.model_dump()

        baseline_result = ml_predict(baseline_dict)
        modified_result = ml_predict(modified_dict)

    except PredictionError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    changes = _detect_changes(baseline_dict, modified_dict, current_user.industry)

    insight, insight_source = _generate_whatif_insight(
        baseline_dict,
        baseline_result["prediction"],
        baseline_result["confidence"] or 0.0,
        modified_dict,
        modified_result["prediction"],
        modified_result["confidence"] or 0.0,
        changes,
        current_user.industry,
    )

    logger.info(
        "What-If simulation: user=%s baseline=%s → modified=%s (insight_source=%s)",
        current_user.username,
        baseline_result["prediction"],
        modified_result["prediction"],
        insight_source,
    )

    return SimulateResponse(
        baseline=SimulateScenario(
            prediction=baseline_result["prediction"],
            confidence=baseline_result["confidence"],
            inputs=baseline_dict,
        ),
        modified=SimulateScenario(
            prediction=modified_result["prediction"],
            confidence=modified_result["confidence"],
            inputs=modified_dict,
        ),
        changed_fields=changes,
        insight=insight,
        insight_source=insight_source,
    )
