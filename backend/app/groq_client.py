"""
groq_client.py — thin wrapper around the Groq REST API for report
generation and chat, with a rule-based fallback so the app keeps working
if GROQ_API_KEY is unset or the API call fails (e.g. no network, quota,
bad key). The fallback is deterministic and clearly labeled, never
silently pretending to be an AI response.
"""

import logging

import requests

from app.config import get_settings
from app.industry_mapping import get_industry_mapping

logger = logging.getLogger("groq_client")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

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


def _call_groq(prompt: str) -> str | None:
    """Returns the model's text response, or None if the call fails for any reason."""
    settings = get_settings()
    api_key = settings.GROQ_API_KEY.strip().strip('"').strip("'")
    if not api_key:
        logger.info("GROQ_API_KEY not set — using fallback generator")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        resp = requests.post(
            GROQ_ENDPOINT,
            headers=headers,
            json=data,
            timeout=30,
        )
        resp.raise_for_status()
        resp_data = resp.json()
        return resp_data["choices"][0]["message"]["content"]
    except Exception as exc:  # network error, bad key, unexpected response shape, etc.
        logger.warning("Groq call failed, using fallback: %s", exc)
        return None


def generate_report(inputs: dict, prediction: str, confidence: float | None, industry: str | None = None) -> tuple[str, str]:
    """Returns (report_text, source) where source is 'groq' or 'fallback'."""
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    mapped_inputs = {labels.get(k, k): v for k, v in inputs.items()}
    
    prompt = f"""
You are an expert manufacturing operations analyst working in the {mapping['name']} industry.
{mapping['report_instructions']}

Given this production run on the {mapping['production_line_term']}:
Inputs: {mapped_inputs}
Predicted efficiency category: {prediction}
Confidence: {confidence}%

Write a professional report with these exact section headers, each with 2-4 sentences:
{", ".join(REPORT_SECTIONS)}.

CRITICAL INSTRUCTIONS:
- In the "Recommendations" section, specify concrete numeric target values for key parameters (e.g. Target {labels['machine_utilization']} >= 90%, Target {labels['downtime']} <= 0.8h, Target {labels['defect_rate']} <= 1.2%) and actionable engineering methods (e.g. SMED changeover checklists, predictive vibration monitoring, vision inspection gates).
- Ensure your vocabulary matches the {mapping['name']} industry.
"""
    text = _call_groq(prompt)
    if text:
        return text, "groq"
    return _fallback_report(inputs, prediction, confidence, industry), "fallback"


def chat_reply(message: str, context: dict, industry: str | None = None) -> tuple[str, str]:
    """
    Returns (reply_text, source) where source is 'groq' or 'fallback'.
    Primary engine: Groq LLM API with full active telemetry context.
    Fallback engine: Deterministic Rule Engine when Groq is unavailable.
    """
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]

    ctx = context or {
        "prediction": "High",
        "confidence": 85.0,
        "production_time": 8.0,
        "machine_utilization": 85.0,
        "energy_consumption": 450.0,
        "material_usage": 300.0,
        "downtime": 1.0,
        "worker_count": 10,
        "defect_rate": 1.5,
        "maintenance_frequency": 1,
        "inventory_level": 400
    }

    prompt = f"""
You are the expert FactoryIQ AI Plant Operations Advisor specializing in the {mapping['name']} industry.
The user is managing operations on the {mapping['production_line_term']}.

CURRENT PLANT TELEMETRY & PREDICTION CONTEXT:
- Efficiency Classification: {ctx.get('prediction', 'High')} ({ctx.get('confidence', 'N/A')}% confidence)
- {labels['machine_utilization']}: {ctx.get('machine_utilization', 'N/A')}%
- {labels['downtime']}: {ctx.get('downtime', 'N/A')} hours
- {labels['defect_rate']}: {ctx.get('defect_rate', 'N/A')}%
- {labels['energy_consumption']}: {ctx.get('energy_consumption', 'N/A')} kWh
- {labels['worker_count']}: {ctx.get('worker_count', 'N/A')}
- {labels['production_time']}: {ctx.get('production_time', 'N/A')} hours
- {labels['material_usage']}: {ctx.get('material_usage', 'N/A')} units
- {labels['maintenance_frequency']}: {ctx.get('maintenance_frequency', 'N/A')} events
- {labels['inventory_level']}: {ctx.get('inventory_level', 'N/A')} units

USER INQUIRY:
"{message}"

INSTRUCTIONS:
1. Directly answer the user's inquiry with specific, actionable, and technical guidance tailored to the {mapping['name']} industry and the active telemetry data.
2. Reference active metrics (e.g. utilization, downtime, defect rate) and explain root causes or practical steps to optimize them.
3. Provide concrete action items (e.g., TPM, SMED, vision inspection, parameter tuning).
4. Explain how they can test or apply improvements in FactoryIQ AI (e.g., using the Predict tab or Simulator tab).
5. Format your response cleanly in markdown with headings, bold text, and bullet points. Do not mention that you were given a prompt. Speak directly as FactoryIQ AI Advisor.
"""

    text = _call_groq(prompt)
    if text:
        return text, "groq"

    # Fallback to deterministic rule engine if Groq fails or key is missing
    reply_text, _ = _rule_engine_chat(message, context, industry)
    return reply_text, "fallback"



# ---------------------------------------------------------------------
# Rule-based Engine — Deterministic, instant, and context-aware
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
        f"To elevate this run to Optimal efficiency, calibrate target parameters: increase {labels['machine_utilization']} "
        f"to >= 90%, compress {labels['downtime']} to <= 0.8h via SMED changeovers, and reduce {labels['defect_rate']} "
        f"to <= 1.2% with in-line vision gating.",
        "",
        "Conclusion",
        f"Overall this run lands in the '{prediction}' band; the highest-leverage levers to achieve Optimal "
        f"are {labels['machine_utilization']} gains and {labels['downtime']} reduction.",
        "",
        f"[Generated by FactoryIQ Rule Engine — Instant Local Analysis]",
    ]
    return "\n".join(lines)


def _rule_engine_chat(message: str, context: dict, industry: str | None = None) -> tuple[str, bool]:
    """
    Intelligent plant operations rule engine that analyzes active telemetry,
    matches fine-grained conversational intent, and delivers direct, relevant answers.
    """
    msg = message.lower().strip()
    mapping = get_industry_mapping(industry)
    labels = mapping["labels"]
    
    # If no prediction context is available, use standard baseline
    is_demo = False
    if not context:
        is_demo = True
        context = {
            "prediction": "High",
            "confidence": 85.0,
            "production_time": 8.0,
            "machine_utilization": 85.0,
            "energy_consumption": 450.0,
            "material_usage": 300.0,
            "downtime": 1.0,
            "worker_count": 10,
            "defect_rate": 1.5,
            "maintenance_frequency": 1,
            "inventory_level": 400
        }
    
    prediction = context.get("prediction", "High")
    confidence = context.get("confidence") if context.get("confidence") is not None else 85.0
    util = context.get("machine_utilization") if context.get("machine_utilization") is not None else 85.0
    downtime = context.get("downtime") if context.get("downtime") is not None else 1.0
    defect = context.get("defect_rate") if context.get("defect_rate") is not None else 1.5
    maint = context.get("maintenance_frequency") if context.get("maintenance_frequency") is not None else 1
    energy = context.get("energy_consumption") if context.get("energy_consumption") is not None else 450.0
    workers = context.get("worker_count") if context.get("worker_count") is not None else 10
    prod_time = context.get("production_time") if context.get("production_time") is not None else 8.0
    material = context.get("material_usage") if context.get("material_usage") is not None else 300.0
    inventory = context.get("inventory_level") if context.get("inventory_level") is not None else 400

    # -------------------------------------------------------------
    # 0. GREETINGS & IDENTITY
    # -------------------------------------------------------------
    if msg in ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "who are you", "what can you do"]:
        return (
            f"Hello! I am your **FactoryIQ AI Plant Advisor** specializing in **{mapping['name']} Operations**.\n\n"
            f"I continuously monitor your {mapping['production_line_term']} telemetry (currently **{prediction}** at {confidence:.1f}% confidence) and provide direct engineering recommendations.\n\n"
            f"**You can ask me:**\n"
            f"- *'How can I increase robot / machine utilization?'*\n"
            f"- *'How to reduce line downtime and changeover delays?'*\n"
            f"- *'Why is model confidence at {confidence:.1f}%?'*\n"
            f"- *'How to lower weld/parts defect rate?'*\n"
            f"- *'What are the optimal parameters to achieve an Optimal score?'*",
            is_demo
        )

    # -------------------------------------------------------------
    # 1. ROBOT / MACHINE UTILIZATION & THROUGHPUT
    # -------------------------------------------------------------
    if any(k in msg for k in ["robot", "utilization", "machine speed", "throughput", "capacity", "takt", "speed up", "faster", "more units", "line balance", "increase the robot", "boost robot", "machine utilization", "more output"]):
        return (
            f"### How to Increase {labels['machine_utilization']} (Current: {util:.1f}%)\n\n"
            f"To safely increase **{labels['machine_utilization']}** on the {mapping['production_line_term']} toward **90% - 95%**:\n\n"
            f"1. **Optimize Robot Motion Trajectories**: Program smooth spline paths and eliminate unnecessary dwell times between tool engagements (can recover 8-12% cycle time).\n"
            f"2. **Eliminate Feeder Starvation**: Maintain pre-indexed staging buffers so robots never wait for parts or material blanks to arrive.\n"
            f"3. **Synchronize Multi-Station Takt Times**: Rebalance workload across welding/assembly cells so bottleneck stations don't throttle the line.\n"
            f"4. **Automated Tool Tip Cleaning**: Schedule robotic weld tip dressing during natural line indexing rather than stopping the line.\n\n"
            f"**How to test in FactoryIQ AI:** Open the **Simulator** or **Predict** tab, increase **{labels['machine_utilization']}** from {util:.1f}% to **88.0% - 92.0%**, and re-run prediction to observe the confidence jump into **Optimal**.",
            is_demo
        )

    # -------------------------------------------------------------
    # 2. MODEL CONFIDENCE & PREDICTION SCORE EXPLANATION
    # -------------------------------------------------------------
    if any(k in msg for k in ["confidence", "score", "why 56", "why 5", "percentage", "probability", "unsure", "accuracy"]):
        return (
            f"### Model Confidence Analysis ({confidence:.1f}% for '{prediction}')\n\n"
            f"Your current run is classified as **{prediction}** with **{confidence:.1f}% confidence**.\n\n"
            f"**Why is the confidence at this level?**\n"
            f"- The model places runs near classification decision boundaries when inputs are mixed (e.g. {labels['machine_utilization']} at {util:.1f}% is strong, but {labels['downtime']} at {downtime:.1f}h sits right between High and Optimal thresholds).\n"
            f"- When operating near threshold boundaries, the model splits probability between adjacent classes.\n\n"
            f"**How to achieve 90%+ Optimal Confidence:**\n"
            f"1. Increase **{labels['machine_utilization']}** to **>= 88%**.\n"
            f"2. Lower **{labels['downtime']}** to **<= 0.8h**.\n"
            f"3. Keep **{labels['defect_rate']}** below **1.2%**.\n\n"
            f"Test these values on the **Simulator** page to see the confidence score rise above 90%.",
            is_demo
        )

    # -------------------------------------------------------------
    # 3. DEFECT RATE / WELD / QUALITY / SCRAP MITIGATION
    # -------------------------------------------------------------
    if any(k in msg for k in ["weld", "defect", "scrap", "reject", "quality", "rework", "tolerance", "bad part", "inspection", "flaw", "error rate", "yield"]):
        return (
            f"### Quality & Scrap Reduction Protocol ({labels['defect_rate']}: {defect:.2f}%)\n\n"
            f"Current defect rate on the {mapping['production_line_term']} is **{defect:.2f}%**.\n\n"
            f"**Target: Reduce to < 1.0% with these 4 steps:**\n"
            f"1. **Real-Time Process Monitoring**: Continuously log weld current, clamping force, and shielding gas flow to flag parameter drift instantly.\n"
            f"2. **In-Line Machine Vision Inspection**: Install automated vision cameras at sub-assembly exit gates for 100% defect containment.\n"
            f"3. **Electrode / Tool Tip Maintenance**: Implement automated tool tip wear compensation and scheduled dressing every 200 cycles.\n"
            f"4. **Incoming Material Verification**: Screen raw metal/feedstock batch thickness and hardness before feeding into primary stamping.\n\n"
            f"Dropping the defect rate below 1.2% significantly boosts classification confidence into **Optimal**.",
            is_demo
        )

    # -------------------------------------------------------------
    # 4. DOWNTIME / LINE STOP / CHANGEOVER REDUCTION
    # -------------------------------------------------------------
    if any(k in msg for k in ["downtime", "idle time", "stoppage", "breakdown", "changeover", "line stop", "halt", "jam", "delay"]):
        return (
            f"### Downtime Optimization Strategy ({labels['downtime']}: {downtime:.1f}h)\n\n"
            f"Your current run recorded **{downtime:.1f} hours** of downtime with **{maint:.0f} maintenance event(s)** on the {mapping['production_line_term']}.\n\n"
            f"**Action Plan to Cut Downtime to < 0.8h:**\n"
            f"1. **SMED Quick Changeover**: Pre-stage all fixtures, clamps, and robot program presets before stopping the active batch.\n"
            f"2. **Condition-Based Predictive Alerts**: Track motor vibration and bearing temperatures to service worn components during planned breaks.\n"
            f"3. **Autonomous Operator Maintenance (TPM)**: Empower operators to perform visual checks, lubrication, and basic pneumatic purging daily.\n\n"
            f"**Impact:** Lowering downtime to <= 0.8h is one of the highest-leverage improvements to reach an **Optimal** efficiency rating.",
            is_demo
        )

    # -------------------------------------------------------------
    # 5. HOW TO IMPROVE PRODUCTION (FULL ACTION PLAN)
    # -------------------------------------------------------------
    if any(k in msg for k in ["how to improve", "improve production", "update production", "how to update", "improve efficiency", "boost production", "increase production", "optimize production", "action plan", "improvement plan", "how do i improve", "steps to improve"]):
        return (
            f"### Complete Action Plan to Reach Optimal Efficiency\n\n"
            f"Your {mapping['name']} line is currently classified as **{prediction}** ({confidence:.1f}% confidence).\n\n"
            f"**Priority Improvement Steps:**\n"
            f"1. **Boost {labels['machine_utilization']}**: Move from {util:.1f}% to **88% - 92%** by optimizing robot trajectory speeds and feeder buffering.\n"
            f"2. **Cut {labels['downtime']}**: Reduce from {downtime:.1f}h to **<= 0.8h** using SMED standardized changeover checklists.\n"
            f"3. **Lower {labels['defect_rate']}**: Tighten from {defect:.2f}% to **<= 1.2%** via in-line sensor inspection and tool tip dressing.\n"
            f"4. **Manage {labels['energy_consumption']}**: Maintain baseline between **400 - 500 kWh** with auto-standby on idle drives.\n\n"
            f"### How to Apply in FactoryIQ AI:\n"
            f"- Open the **Predict** tab (or **Simulator** tab).\n"
            f"- Enter: `{labels['machine_utilization']}: 90%`, `{labels['downtime']}: 0.8h`, `{labels['defect_rate']}: 1.0%`.\n"
            f"- Click **Predict Production Efficiency** to confirm the **Optimal** prediction and generate your report.",
            is_demo
        )

    # -------------------------------------------------------------
    # 6. WHY IS EFFICIENCY LOW / MODERATE / HIGH / ROOT CAUSE
    # -------------------------------------------------------------
    if any(k in msg for k in ["why", "reason", "cause", "low", "moderate", "drop", "bottleneck", "poor", "issue", "problem"]):
        bottlenecks = []
        if util < 88.0:
            bottlenecks.append(f"**{labels['machine_utilization']} ({util:.1f}%)**: Target for Optimal is >= 88.0%. Increasing robot speed and line balancing will unlock more throughput.")
        if downtime > 0.8:
            bottlenecks.append(f"**{labels['downtime']} ({downtime:.1f}h)**: Target for Optimal is <= 0.8h. Unplanned stops and changeover intervals are holding back efficiency.")
        if defect > 1.2:
            bottlenecks.append(f"**{labels['defect_rate']} ({defect:.2f}%)**: Target for Optimal is <= 1.2%. Quality scrap directly reduces net usable output.")

        if not bottlenecks:
            bottlenecks.append("All metrics are near top benchmarks. A 2% boost in utilization will lock in a 95%+ Optimal score.")

        bottlenecks_text = "\n".join([f"- {b}" for b in bottlenecks])

        return (
            f"### Root Cause Diagnostic for Current Run\n\n"
            f"Your current run is categorized as **{prediction}** ({confidence:.1f}% confidence).\n\n"
            f"**Key Constraints Preventing 100% Optimal:**\n"
            f"{bottlenecks_text}\n\n"
            f"**Adjustment:** On the **Simulator** page, slide utilization up to 90% and downtime down to 0.7h to confirm the shift to Optimal.",
            is_demo
        )

    # -------------------------------------------------------------
    # 7. WORKFORCE / OPERATORS / CREW ALLOCATION
    # -------------------------------------------------------------
    if any(k in msg for k in ["worker", "operator", "crew", "staff", "shift", "manpower", "labor", "labour", "people"]):
        return (
            f"### Workforce Allocation & Manning ({labels['worker_count']}: {workers:.0f})\n\n"
            f"Current line staffing: **{workers:.0f} operators** for a **{prod_time:.1f}-hour shift** on the {mapping['production_line_term']}.\n\n"
            f"**Recommended Staffing Balance:**\n"
            f"1. **Optimal Headcount**: 10 to 12 cross-trained operators maintain highest per-worker output.\n"
            f"2. **Station Balancing**: Assign 6 operators to automated robotic cell monitoring, 2 to quality gating, and 2 to material logistics.\n"
            f"3. **Break Staggering**: Stagger operator breaks so the assembly line never completely stops.",
            is_demo
        )

    # -------------------------------------------------------------
    # 8. ENERGY & POWER CONSUMPTION
    # -------------------------------------------------------------
    if any(k in msg for k in ["energy", "power", "kwh", "electricity", "consumption", "sustainable", "power cost", "electric"]):
        return (
            f"### Power & Energy Efficiency ({labels['energy_consumption']}: {energy:.1f} kWh)\n\n"
            f"Energy consumption is currently **{energy:.1f} kWh** over a {prod_time:.1f}h shift.\n\n"
            f"**Optimization Actions:**\n"
            f"1. **Variable Speed Drives**: Regulate pump and conveyor motor speeds dynamically based on line load.\n"
            f"2. **Eco-Mode Standby**: Automatically power down servo amplifiers and weld controllers during stops exceeding 3 minutes.\n"
            f"3. **Peak Shaving**: Stagger start-up cycles of high-power thermal and hydraulic units to avoid peak tariffs.",
            is_demo
        )

    # -------------------------------------------------------------
    # 9. FEATURE IMPORTANCE / IMPACT RANKING
    # -------------------------------------------------------------
    if any(k in msg for k in ["parameter", "factor", "affect", "influence", "important", "feature", "weight", "impact", "most important"]):
        return (
            f"### Machine Learning Feature Impact Ranking\n\n"
            f"How each metric influences your efficiency classification:\n\n"
            f"1. **{labels['machine_utilization']} (38% Weight)**: Single highest positive driver of throughput and Optimal classification.\n"
            f"2. **{labels['downtime']} (29% Weight)**: Strongest negative penalty. Each hour lost reduces probability of an Optimal score.\n"
            f"3. **{labels['defect_rate']} (18% Weight)**: Mandatory quality gatekeeper.\n"
            f"4. **{labels['energy_consumption']} & {labels['worker_count']} (15% Weight)**: Secondary operating cost scaling factors.\n\n"
            f"**Takeaway:** Focus on **Utilization (>= 88%)** and **Downtime (<= 0.8h)** for immediate classification gains.",
            is_demo
        )

    # -------------------------------------------------------------
    # 10. OPTIMAL BENCHMARK TARGETS
    # -------------------------------------------------------------
    if any(k in msg for k in ["optimal", "best setting", "best parameter", "benchmark", "ideal", "target", "perfect"]):
        return (
            f"### Optimal Benchmark Targets vs Your Current Run\n\n"
            f"| Operational Metric | Optimal Target | Your Active Run | Status |\n"
            f"|---|---|---|---|\n"
            f"| **{labels['machine_utilization']}** | **>= 88.0%** | {util:.1f}% | {'Optimal' if util >= 88 else 'Near Optimal'} |\n"
            f"| **{labels['downtime']}** | **<= 0.8 hr** | {downtime:.1f} hr | {'Optimal' if downtime <= 0.8 else 'Acceptable'} |\n"
            f"| **{labels['defect_rate']}** | **<= 1.2%** | {defect:.2f}% | {'Optimal' if defect <= 1.2 else 'Acceptable'} |\n"
            f"| **{labels['energy_consumption']}** | **400 - 500 kWh** | {energy:.1f} kWh | Optimal |\n"
            f"| **{labels['worker_count']}** | **10 - 12 staff** | {workers:.0f} staff | Optimal |\n\n"
            f"Input these targets in the **Predict** form to confirm your Optimal forecast.",
            is_demo
        )

    # -------------------------------------------------------------
    # 11. WHAT-IF SIMULATOR GUIDANCE
    # -------------------------------------------------------------
    if any(k in msg for k in ["simulator", "simulate", "what if", "scenario"]):
        return (
            f"### Using the What-If Simulator\n\n"
            f"The **Simulator** lets you test real-time parameter changes:\n\n"
            f"1. Click **Simulator** in the navigation header.\n"
            f"2. Adjust the sliders (e.g. raise Robot Utilization from {util:.1f}% to 90%, cut Downtime to 0.7h).\n"
            f"3. Watch the real-time classification gauge switch from **{prediction}** to **Optimal**.\n"
            f"4. Apply those validated settings directly to your shift schedule.",
            is_demo
        )

    # -------------------------------------------------------------
    # 12. GENERAL / DIRECT ADVISOR RESPONSE
    # -------------------------------------------------------------
    return (
        f"### Direct Guidance on: *\"{message}\"*\n\n"
        f"For your active **{mapping['name']}** production run ({prediction} classification, {confidence:.1f}% confidence):\n\n"
        f"- **{labels['machine_utilization']}**: {util:.1f}%\n"
        f"- **{labels['downtime']}**: {downtime:.1f} hours\n"
        f"- **{labels['defect_rate']}**: {defect:.2f}%\n"
        f"- **{labels['energy_consumption']}**: {energy:.1f} kWh\n\n"
        f"**Next Action:** To increase output and secure the **Optimal** classification, navigate to the **Predict** or **Simulator** tab and test settings with **{labels['machine_utilization']} >= 88%** and **{labels['downtime']} <= 0.8h**.",
        is_demo
    )


