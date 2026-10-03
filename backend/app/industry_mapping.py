"""
industry_mapping.py — Centralized configuration for Multi-Industry Mode terminology,
labels, PDF formatting, chatbot personas, and AI generation parameters.
"""

INDUSTRY_MAPPINGS = {
    "🚗 Automotive": {
        "name": "Automotive",
        "emoji": "🚗",
        "production_line_term": "Assembly Line",
        "pdf_title": "Automotive Assembly Line Performance Report",
        "labels": {
            "production_time": "Shift Duration (Hours)",
            "machine_utilization": "Robot Utilization (%)",
            "energy_consumption": "Power Consumption (kWh)",
            "material_usage": "Steel & Alloy Weight (kg)",
            "downtime": "Line Downtime (Hours)",
            "worker_count": "Assembly Operators",
            "defect_rate": "Weld/Parts Defect Rate (%)",
            "maintenance_frequency": "Robotic Calibration/Month",
            "inventory_level": "WIP Parts Inventory (Units)",
        },
        "chatbot_persona": "You are the Automotive Assembly Line AI Coordinator. You specialize in welding robots, stamping presses, paint shops, torque specifications, and OEE optimization.",
        "report_instructions": "This run is an automotive manufacturing run. Tailor the analysis to focus on robotic cycle times, sheet metal stamping tolerances, body-in-white welding quality, and paint shop oven temperatures.",
    },
    "📱 Electronics": {
        "name": "Electronics",
        "emoji": "📱",
        "production_line_term": "SMT Line",
        "pdf_title": "Electronics SMT & Cleanroom Yield Report",
        "labels": {
            "production_time": "SMT Run Time (Hours)",
            "machine_utilization": "Pick & Place Duty Cycle (%)",
            "energy_consumption": "Cleanroom Power (kWh)",
            "material_usage": "Silicon & Solder Weight (kg)",
            "downtime": "Feeder Jam Downtime (Hours)",
            "worker_count": "Cleanroom Technicians",
            "defect_rate": "Component Defect Rate (%)",
            "maintenance_frequency": "Nozzle Calibration/Month",
            "inventory_level": "PCB & Component Stock (Units)",
        },
        "chatbot_persona": "You are the SMT & Electronics Cleanroom Operations AI. You specialize in pick-and-place placement rates, solder reflow temperature profiles, cleanroom class standards, AOI systems, and ESD safety.",
        "report_instructions": "This run is an electronics SMT manufacturing run. Tailor the analysis to focus on high-speed component placements, solder paste deposition accuracy, reflow oven profiles, cleanroom environmental control, and First Pass Yield (FPY).",
    },
    "💊 Pharmaceutical": {
        "name": "Pharmaceutical",
        "emoji": "💊",
        "production_line_term": "Compounding & Batch Press",
        "pdf_title": "Pharmaceutical Batch & GMP Performance Report",
        "labels": {
            "production_time": "Batch Run Duration (Hours)",
            "machine_utilization": "Reactor/Press Utilization (%)",
            "energy_consumption": "Sterilization Power (kWh)",
            "material_usage": "Active Ingredients (API) (kg)",
            "downtime": "CIP/SIP Validation Downtime (Hours)",
            "worker_count": "QA & Lab Operators",
            "defect_rate": "Batch Deviation Rate (%)",
            "maintenance_frequency": "Autoclave Validation/Month",
            "inventory_level": "API & Excipient Stock (Units)",
        },
        "chatbot_persona": "You are the Pharma GMP Compliance & Compounding Operations AI. You specialize in clean-in-place (CIP) logs, autoclave sterilization cycles, active ingredient weight assays, FDA batch records, and quality control deviations.",
        "report_instructions": "This run is a pharmaceutical compounding and batch packaging run. Tailor the analysis to focus on GMP standards validation, active pharmaceutical ingredient (API) chemical assays, tablet dissolution test results, and autoclave logs.",
    },
    "🍪 Food Processing": {
        "name": "Food Processing",
        "emoji": "🍪",
        "production_line_term": "Baking & Packaging Line",
        "pdf_title": "Food Processing Line & Spoilage Report",
        "labels": {
            "production_time": "Oven/Line Run Time (Hours)",
            "machine_utilization": "Mixer & Extruder Capacity (%)",
            "energy_consumption": "Oven/Cooler Energy (kWh)",
            "material_usage": "Raw Ingredients Weight (kg)",
            "downtime": "Washdown/Sanitation Downtime (Hours)",
            "worker_count": "Sanitation & Line Operators",
            "defect_rate": "Food Spoilage/Reject Rate (%)",
            "maintenance_frequency": "Oven Calibration/Month",
            "inventory_level": "Ingredient Silo Stock (Units)",
        },
        "chatbot_persona": "You are the Food & Beverage Packaging & Safety Operations AI. You specialize in HACCP safety controls, allergen zoning, washdown sanitation protocols, mixer capacity factors, and pasteurization temperature limits.",
        "report_instructions": "This run is a food processing and packaging line run. Tailor the analysis to focus on HACCP control limits, recipe scaling precision, oven temperature profiles, and washdown/sanitation schedule compliance.",
    },
    "🧵 Textile": {
        "name": "Textile",
        "emoji": "🧵",
        "production_line_term": "Weaving & Loom Line",
        "pdf_title": "Textile Loom Efficiency & Quality Report",
        "labels": {
            "production_time": "Loom Run Time (Hours)",
            "machine_utilization": "Loom Operating Duty (%)",
            "energy_consumption": "Spindle Power (kWh)",
            "material_usage": "Yarn & Fiber Weight (kg)",
            "downtime": "Thread Breakage Downtime (Hours)",
            "worker_count": "Loom Operators",
            "defect_rate": "Fabric Defect/Breakage Rate (%)",
            "maintenance_frequency": "Loom Lubrication/Month",
            "inventory_level": "Fabric Roll Inventory (Units)",
        },
        "chatbot_persona": "You are the Textile Weaving & Loom Production AI. You specialize in spindle speeds, thread warp/weft tension checks, automated loom mechanics, dye batch chemical uniformity, and fabric defect inspection.",
        "report_instructions": "This run is a textile spinning and loom weaving run. Tailor the analysis to focus on thread break frequency, loom mechanical wear, yarn tension stabilization, fabric grading standards, and dye vat heating cycle consistency.",
    },
    "🧴 Cosmetics": {
        "name": "Cosmetics",
        "emoji": "🧴",
        "production_line_term": "Filling & Packaging Line",
        "pdf_title": "Cosmetics Production & Filling Performance Report",
        "labels": {
            "production_time": "Filling Line Run Time (Hours)",
            "machine_utilization": "Homogenizer/Filler Duty (%)",
            "energy_consumption": "Filling Power (kWh)",
            "material_usage": "Bulk Formula Weight (kg)",
            "downtime": "Nozzle Cleaning Downtime (Hours)",
            "worker_count": "Filling Line Operators",
            "defect_rate": "Bottle/Fill Reject Rate (%)",
            "maintenance_frequency": "Filler Calibration/Month",
            "inventory_level": "Vial & Bottle Inventory (Units)",
        },
        "chatbot_persona": "You are the Cosmetics Filling & Liquid Batch Production AI. You specialize in formula emulsification uniformity, nozzle clog prevention, capping machine torque, package sealing, and batch color matching.",
        "report_instructions": "This run is a cosmetics manufacturing and bottling line run. Tailor the analysis to focus on homogenization viscosity limits, nozzle extrusion consistency, capping validation parameters, and batch color matching index.",
    },
}


def get_industry_mapping(industry_name: str | None) -> dict:
    """Returns the mapping for the selected industry, fallback to Automotive if missing."""
    if not industry_name or industry_name not in INDUSTRY_MAPPINGS:
        # Check if they passed the clean name instead of name with emoji
        for key, mapping in INDUSTRY_MAPPINGS.items():
            if mapping["name"] == industry_name:
                return mapping
        # Return default
        return INDUSTRY_MAPPINGS["🚗 Automotive"]
    return INDUSTRY_MAPPINGS[industry_name]
