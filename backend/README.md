# FactoryIQ AI — Phase 2: FastAPI Backend

## ⚠️ Important: this code is untested-by-execution

This sandbox has no internet access, so `pip install` can't reach PyPI here
and FastAPI/SQLAlchemy/passlib were never actually importable in this
environment. Every file was syntax-checked (`python -m py_compile`) and the
JWT create/decode logic was verified standalone with PyJWT (which *was*
available offline) — but the app has not been run end-to-end with a live
server. Run it in your own environment (which has internet) and let me know
if anything breaks — happy to fix it.

## Setup

```bash
cd backend
python -m venv venv && source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# edit .env: set a real SECRET_KEY, optionally GEMINI_API_KEY

uvicorn main:app --reload --port 8000
```

Docs at `http://localhost:8000/docs` (Swagger UI — you can test every
endpoint from there directly).

**Before `/predict` will work**, run the Phase 1 ML pipeline so
`ml/models/best_model.pkl` etc. exist:

```bash
cd ../ml
python data/generate_data.py   # or drop in the real Kaggle CSV
python train.py
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | — | Create account, returns JWT |
| POST | `/login` | — | OAuth2 password flow, returns JWT |
| POST | `/predict` | ✅ | Run the ML model on 9 input features, saves to history |
| POST | `/generate-report` | ✅ | Gemini-written report on a prediction (or local fallback) |
| POST | `/chat` | ✅ | Chat about the latest prediction (Gemini or local fallback) |
| GET | `/history` | ✅ | List the current user's past predictions |
| GET | `/profile` | ✅ | Current user's profile |

Auth: send `Authorization: Bearer <token>` on protected routes. `/login`
expects `application/x-www-form-urlencoded` (`username`, `password`) since
it uses FastAPI's standard `OAuth2PasswordRequestForm` — that's what the
Swagger UI's "Authorize" button does automatically.

## Design notes

- **Model loading**: `routers/predict.py` imports `ml/predict.py`'s
  module-level singleton, so the trained model is loaded into memory once
  at server startup, not on every request.
- **Gemini calls degrade gracefully**: if `GEMINI_API_KEY` is blank or the
  API call fails for any reason (network, quota, bad key), `/generate-report`
  and `/chat` automatically fall back to a rule-based generator instead of
  erroring out. The response always includes `"source": "gemini"` or
  `"source": "fallback"` so the frontend can show which one produced it.
- **Database**: SQLite by default (zero setup); swap `DATABASE_URL` in
  `.env` for a Postgres URL to use that instead — no code changes needed.
- **Passwords**: hashed with bcrypt via passlib, never stored or logged in
  plaintext.
- **Validation**: Pydantic schemas enforce sane ranges (e.g. utilization
  0–100%, downtime can't exceed production time) before anything reaches
  the model.

## Quick manual test sequence (once running)

```bash
# 1. Register
curl -X POST http://localhost:8000/register -H "Content-Type: application/json" \
  -d '{"username":"arun","email":"arun@example.com","password":"password123"}'

# 2. Login (form-encoded)
curl -X POST http://localhost:8000/login -d "username=arun&password=password123"
# -> copy the access_token from the response

# 3. Predict (replace TOKEN)
curl -X POST http://localhost:8000/predict -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{
    "production_time": 8.5, "machine_utilization": 82, "energy_consumption": 480,
    "material_usage": 300, "downtime": 1.2, "worker_count": 35,
    "defect_rate": 2.0, "maintenance_frequency": 5, "inventory_level": 400
  }'

# 4. Report
curl -X POST http://localhost:8000/generate-report -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{}'

# 5. Chat
curl -X POST http://localhost:8000/chat -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" -d '{"message":"why is efficiency low?"}'

# 6. History / Profile
curl http://localhost:8000/history -H "Authorization: Bearer TOKEN"
curl http://localhost:8000/profile -H "Authorization: Bearer TOKEN"
```

## Next

Phase 3 (Gemini reports) and Phase 4 (chatbot) are already wired in as
part of this backend, since they're small enough to build alongside the
API rather than as separate phases — see `app/gemini_client.py`. Phase 5
(React frontend) is next.
