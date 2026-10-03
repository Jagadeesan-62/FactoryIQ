"""
claude_client.py — thin wrapper around the Anthropic REST API for report
generation and chat, with a rule-based fallback so the app keeps working
if ANTHROPIC_API_KEY is unset or the API call fails (e.g. no network, quota,
bad key). The fallback is deterministic and clearly labeled, never
silently pretending to be an AI response.
"""

import logging

import requests

from app.config import get_settings
from app.industry_mapping import get_industry_mapping

logger = logging.getLogger("claude_client")

ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages"

REPORT_SECTIONS = [
    "Production Summary",
    "Prediction",
    "Confidence",
    "Key Factors",
    "Production Insights",
    "Risk Analysis",
    "Energy Analysis",
    "Machine Utilization Analysis",
    "Recommendations",
    "Conclusion",
]


def _call_claude(prompt: str) -> str | None:
    """Returns the model's text response, or None if the call fails for any reason."""
    settings = get_settings()
    api_key = settings.ANTHROPIC_API_KEY.strip().strip('"').strip("'")
    if not api_key:
        logger.info("ANTHROPIC_API_KEY not set — using fallback generator")
        return None

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    data = {
        "model": settings.CLAUDE_MODEL,
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        resp = requests.post(
            ANTHROPIC_ENDPOINT,
            headers=headers,
            json=data,
            timeout=30,
        )
        resp.raise_for_status()
        resp_data = resp.json()
        return resp_data["content"][0]["text"]
    except Exception as exc:  # network error, bad key, unexpected response shape, etc.
        logger.warning("Claude call failed, using fallback: %s", exc)
        return None


def generate_report(inputs: dict, prediction: str, confidence: float | None, industry: str | None = None) -> tuple[str, str]:
    """Returns (report_text, source) where source is 'claude' or 'fallback'."""
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    mapped_inputs = {labels.get(k, k): v for k, v in inputs.items()}
    
    prompt = f"""
You are a manufacturing operations analyst working in the {mapping['name']} industry.
{mapping['report_instructions']}

Given this production run on the {mapping['production_line_term']}:
Inputs: {mapped_inputs}
Predicted efficiency category: {prediction}
Confidence: {confidence}%

Write a professional report with these exact section headers, each with 2-4
sentences: {", ".join(REPORT_SECTIONS)}.
Ensure your vocabulary matches the {mapping['name']} industry (e.g. use terms like {labels['defect_rate']} instead of generic defect rates).
"""
    text = _call_claude(prompt)
    if text:
        return text, "claude"
    return _fallback_report(inputs, prediction, confidence, industry), "fallback"


def chat_reply(message: str, context: dict, industry: str | None = None) -> tuple[str, str]:
    """Returns (reply_text, source) where source is 'claude' or 'fallback'."""
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    # 1. Determine if the question matches any rule-based default question
    msg = message.lower()
    is_default_q = (
        # 1. Why is efficiency low / moderate?
        (("why" in msg or "reason" in msg) and ("low" in msg or "moderate" in msg or "drop" in msg or "efficiency" in msg or "poor" in msg)) or
        # 2. How can downtime be reduced?
        ("downtime" in msg and ("reduce" in msg or "cut" in msg or "minimize" in msg or "prevent" in msg or "lower" in msg)) or
        # 3. How can production / efficiency be improved?
        ("improve" in msg or "optimize" in msg or "better" in msg or "production" in msg) or
        # 4. Explain today's report
        ("explain" in msg or "report" in msg or "summarize" in msg) or
        # 5. What parameters affect efficiency most?
        ("parameter" in msg or "factor" in msg or "affect" in msg or "influence" in msg or "important" in msg)
    )

    if is_default_q:
        # Directly use rule-based model
        fallback_text, is_demo = _fallback_chat(message, context, industry)
        note_suffix = " (Demo Context) [Rule Engine]" if is_demo else " [Rule Engine]"
        return fallback_text + note_suffix, "fallback"

    # 2. For custom questions, use Claude with a minimal token prompt
    mapped_context = {}
    for k, v in context.items():
        if k in labels:
            mapped_context[labels[k]] = v
        else:
            mapped_context[k] = v

    fallback_text, is_demo = _fallback_chat(message, context, industry)

    prompt = f"Role: AI {mapping['name']} Plant Assistant. Be concise. Context: {mapped_context}. Query: {message}"
    
    text = _call_claude(prompt)
    if text:
        return text, "claude"
    
    note_suffix = " (Demo Context) [fallback]" if is_demo else " [fallback]"
    return fallback_text + note_suffix, "fallback"


# ---------------------------------------------------------------------
# Rule-based fallbacks — used whenever Claude is unavailable, so every
# endpoint still returns something useful.
# ---------------------------------------------------------------------

def _fallback_report(inputs: dict, prediction: str, confidence: float | None, industry: str | None = None) -> str:
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    util = inputs.get("machine_utilization")
    downtime = inputs.get("downtime")
    defect = inputs.get("defect_rate")
    energy = inputs.get("energy_consumption")
    maint = inputs.get("maintenance_frequency")

    lines = [
        "Production Summary",
        f"This production run recorded {inputs.get('production_time')} hours of "
        f"{labels['production_time']} with {inputs.get('worker_count')} {labels['worker_count']} on the floor.",
        "",
        "Prediction",
        f"The model classified this run as '{prediction}' efficiency.",
        "",
        "Confidence",
        f"Model confidence in this prediction: {confidence if confidence is not None else 'N/A'}%.",
        "",
        "Key Factors",
        f"{labels['machine_utilization']} ({util}%), {labels['downtime']} ({downtime}h), and {labels['defect_rate']} "
        f"({defect}%) were the most influential inputs for this prediction.",
        "",
        "Production Insights",
        f"{labels['machine_utilization']} of {util}% combined with {downtime}h of {labels['downtime']} shapes the "
        f"overall throughput picture for this {mapping['production_line_term']}.",
        "",
        "Risk Analysis",
        f"A {labels['defect_rate']} of {defect}% and {maint} {labels['maintenance_frequency']} events this period "
        + (f"suggest elevated risk to output quality." if defect and defect > 8 else
           "are within a normal operating range."),
        "",
        "Energy Analysis",
        f"{labels['energy_consumption']} was {energy} kWh for this run"
        + (", above the typical baseline." if energy and energy > 700 else "."),
        "",
        "Machine Utilization Analysis",
        f"{labels['machine_utilization']} at {util}% is "
        + ("strong and close to capacity." if util and util >= 80 else
           "moderate, with room to improve scheduling or reduce idle time."),
        "",
        "Recommendations",
        f"Focus on reducing {labels['downtime']} and {labels['defect_rate']} first, since both directly "
        f"pull the efficiency category down; review {labels['maintenance_frequency']} cadence if "
        f"{labels['downtime']} is trending upward.",
        "",
        "Conclusion",
        f"Overall this run lands in the '{prediction}' band; the levers most "
        f"likely to move it up are {labels['downtime']} reduction and {labels['machine_utilization']} gains.",
        "",
        f"[Generated by local fallback — set ANTHROPIC_API_KEY for AI-written reports]",
    ]
    return "\n".join(lines)


def _fallback_chat(message: str, context: dict, industry: str | None = None) -> tuple[str, bool]:
    msg = message.lower()
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    # If no prediction context is available, use a demo context so the chat is instantly testable
    is_demo = False
    if not context:
        is_demo = True
        context = {
            "prediction": "Moderate",
            "confidence": 82.4,
            "production_time": 8.0,
            "machine_utilization": 72.5,
            "energy_consumption": 520.0,
            "material_usage": 340.0,
            "downtime": 2.5,
            "worker_count": 12,
            "defect_rate": 2.8,
            "maintenance_frequency": 1,
            "inventory_level": 400
        }
    
    prediction = context.get("prediction", "unknown")
    confidence = context.get("confidence", 0.0)
    util = context.get("machine_utilization")
    downtime = context.get("downtime")
    defect = context.get("defect_rate")
    maint = context.get("maintenance_frequency")
    energy = context.get("energy_consumption")
    workers = context.get("worker_count")
    prod_time = context.get("production_time")

    # 1. Why is efficiency low / moderate?
    if ("why" in msg or "reason" in msg) and ("low" in msg or "moderate" in msg or "drop" in msg or "efficiency" in msg or "poor" in msg):
        reasons = []
        if downtime and downtime > 2.0:
            reasons.append(f"high {labels['downtime'].lower()} ({downtime:.1f} hours)")
        if defect and defect > 3.0:
            reasons.append(f"an elevated {labels['defect_rate'].lower()} ({defect:.2f}%)")
        if util and util < 75.0:
            reasons.append(f"low {labels['machine_utilization'].lower()} ({util:.1f}%)")
        if energy and energy > 700:
            reasons.append(f"high {labels['energy_consumption'].lower()} ({energy:.1f} kWh)")
            
        if not reasons:
            reasons.append("standard operational noise")
            
        reasons_str = ", and ".join(reasons) if len(reasons) <= 2 else ", ".join(reasons[:-1]) + ", and " + reasons[-1]
        return (
            f"Based on the latest production run on the {mapping['production_line_term']} (classified as '{prediction}' with {confidence:.1f}% confidence), "
            f"the efficiency is primarily constrained by {reasons_str}. "
            "To move to a higher efficiency category, focus on stabilizing these metrics.",
            is_demo
        )

    # 2. How can downtime be reduced?
    if "downtime" in msg and ("reduce" in msg or "cut" in msg or "minimize" in msg or "prevent" in msg or "lower" in msg):
        dt_val = downtime if downtime is not None else 0.0
        maint_val = maint if maint is not None else 0.0
        return (
            f"Your latest run logged {dt_val:.1f} hours of {labels['downtime'].lower()} with {maint_val:.0f} {labels['maintenance_frequency'].lower()} events. "
            f"To reduce {labels['downtime'].lower()} on the {mapping['production_line_term']}, consider: "
            "1) Shifting from reactive to predictive maintenance scheduling, "
            "2) Standardizing setup and changeover procedures (SMED), "
            "3) Implementing real-time sensor monitoring to flag mechanical anomalies early.",
            is_demo
        )

    # 3. How can production / efficiency be improved?
    if "improve" in msg or "optimize" in msg or "better" in msg or "production" in msg:
        advices = []
        if downtime and downtime > 1.5:
            advices.append(f"reduce {labels['downtime'].lower()} from {downtime:.1f}h by optimizing {labels['maintenance_frequency'].lower()} (currently {maint:.0f}/month)")
        if defect and defect > 2.0:
            advices.append(f"tighten quality control to lower the {labels['defect_rate'].lower()} from {defect:.2f}%")
        if util and util < 80.0:
            advices.append(f"enhance machine scheduling to increase {labels['machine_utilization'].lower()} above {util:.1f}%")
        
        if not advices:
            advices.append(f"increase throughput by expanding the production schedule or optimizing batch sizes on the {mapping['production_line_term']}")
            
        advices_str = "; ".join(advices)
        return (
            f"To improve production efficiency from the current '{prediction}' level: "
            f"You should: {advices_str}. "
            "These adjustments directly correlate with the higher-efficiency class thresholds.",
            is_demo
        )

    # 4. Explain today's report
    if "explain" in msg or "report" in msg or "summarize" in msg:
        p_time = prod_time if prod_time is not None else 0.0
        w_val = workers if workers is not None else 0.0
        if context.get("report"):
            return (
                f"Today's report covers a run of {p_time:.1f} hours of {labels['production_time']} with {w_val:.0f} {labels['worker_count']}. "
                f"The model predicted '{prediction}' efficiency. "
                f"The analysis indicates that the primary drivers were {labels['machine_utilization']} and {labels['downtime']} "
                "patterns, and highlights downtime reduction and quality controls as key recommendations.",
                is_demo
            )
        return (
            f"The latest run is classified as '{prediction}' efficiency. "
            "No full report text is currently saved in this context, but you can generate one by "
            "calling the report generator or exporting to PDF.",
            is_demo
        )

    # 5. What parameters affect efficiency most?
    if "parameter" in msg or "factor" in msg or "affect" in msg or "influence" in msg or "important" in msg:
        return (
            "According to the machine learning feature importance analysis on our dataset: "
            f"1) **{labels['machine_utilization']}** has the strongest positive impact on efficiency, "
            f"2) **{labels['downtime']}** has the strongest negative impact on efficiency, "
            f"3) **{labels['defect_rate']}** has a major negative impact on quality and efficiency classification. "
            f"Operational duration, {labels['worker_count'].lower()} counts, and energy usage act as secondary scale parameters.",
            is_demo
        )

    # Catch-all
    return (
        f"I am the {mapping['name']} Plant Assistant. I am here to analyze your latest run ('{prediction}' efficiency with {confidence:.1f}% confidence). "
        f"Feel free to ask me: 'Why is efficiency low?', 'How can {labels['downtime'].lower()} be reduced?', "
        f"'How can production be improved?', 'Explain today's report', or 'What parameters affect efficiency most?'.",
        is_demo
    )
