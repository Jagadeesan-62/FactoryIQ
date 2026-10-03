# FactoryIQ AI — Machine Learning-Based Production Efficiency Optimization System

Predicts manufacturing production efficiency (`Low` / `Moderate` / `High` /
`Optimal`) from 9 operational inputs, with AI-generated reports and a
context-aware chatbot.

## Status

| Phase | Contents | Status |
|---|---|---|
| 1 — ML pipeline | `ml/` — EDA, preprocessing, model training/comparison, `predict.py` | ✅ Built & tested |
| 2 — Backend API | `backend/` — FastAPI, JWT auth, SQLAlchemy, Gemini report + chat (with offline fallback) | ✅ Built, syntax-checked (see caveat below) |
| 3 — Frontend | React + Tailwind + Material UI dashboard | ⏳ Not started |
| 4 — Deployment | Docker Compose (backend service scaffolded, frontend to add) | ⏳ Partial |

## ⚠️ Two honesty notes

1. **Dataset**: `ml/data/generate_data.py` builds a synthetic dataset
   matching the schema of the Kaggle "manufacturing-production-data"
   dataset, since this build environment has no internet access to
   download the real file. Swap in the real CSV any time — see
   `ml/README.md`.
2. **Backend testing**: this sandbox also has no internet access for
   `pip install`, so FastAPI/SQLAlchemy/passlib were never importable
   here. The backend code was syntax-checked file by file and the JWT
   logic was verified standalone, but it hasn't run end-to-end with a
   live server yet. Run it in your own environment and flag anything
   that breaks.

## Quick start

```bash
# 1. Train the model
cd ml
pip install -r requirements.txt
python data/generate_data.py
python train.py

# 2. Run the API
cd ../backend
pip install -r requirements.txt
cp .env.example .env   # edit SECRET_KEY, optionally GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

Then open `http://localhost:8000/docs` to try every endpoint.

See `ml/README.md` and `backend/README.md` for full details on each phase.

## Structure

```
OptiManufacture/
├── ml/                  # Phase 1 — training pipeline + saved model
├── backend/              # Phase 2 — FastAPI app
├── images/                # EDA + model evaluation plots
└── docker-compose.yml     # backend service (frontend to be added)
```
