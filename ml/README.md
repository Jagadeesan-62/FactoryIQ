# FactoryIQ AI — Phase 1: ML Pipeline

Predicts production efficiency category (`Low`, `Moderate`, `High`, `Optimal`)
from 9 manufacturing operational features.

## ⚠️ About the dataset

This pipeline was built and validated using a **synthetic dataset**
(`data/generate_data.py`) that mirrors the column structure described for
the Kaggle "manufacturing-production-data" dataset, because this build
environment has no internet access to download the real file.

**To use the real Kaggle data:** download the CSV, drop it in `data/` as
`manufacturing_data.csv`, and check that its column names match
`FEATURE_COLS` in `preprocess.py` (rename columns or edit that list if they
differ). Everything else — EDA, training, prediction — works unchanged.

## Files

| File | Purpose |
|---|---|
| `data/generate_data.py` | Builds the synthetic dataset (swap for real CSV) |
| `eda.py` | Overview, missing values, duplicates, correlation heatmap, class distribution, histograms, boxplots |
| `preprocess.py` | Shared cleaning/encoding/scaling logic used by both training and inference |
| `train.py` | Trains Logistic Regression, Decision Tree, Random Forest; compares by accuracy/precision/recall/F1; saves the best one |
| `predict.py` | Loads the saved model once; `predict(record)` returns `{"prediction": ..., "confidence": ...}` |
| `models/` | `best_model.pkl`, `scaler.pkl`, `encoder.pkl`, `metrics.json` |
| `../images/` | All EDA and evaluation plots |

## Run order

```bash
pip install -r requirements.txt
python data/generate_data.py   # or drop in the real Kaggle CSV
python eda.py                  # exploratory analysis + plots
python train.py                # trains, compares, saves best model
python predict.py              # smoke test with a sample record
```

## Current results (on synthetic data)

Logistic Regression came out on top by F1 score. See `models/metrics.json`
for exact numbers per model — re-run `train.py` on the real dataset and
these will change (likely improve, since the synthetic labels are a
simplified linear-ish function of the features).

## Using `predict.py` from other code (e.g. the FastAPI backend)

```python
from predict import predict

result = predict({
    "production_time": 8.5,
    "machine_utilization": 82,
    "energy_consumption": 480,
    "material_usage": 300,
    "downtime": 1.2,
    "worker_count": 35,
    "defect_rate": 2.0,
    "maintenance_frequency": 5,
    "inventory_level": 400,
})
# {"prediction": "High", "confidence": 87.3}
```

The model is loaded once at first call (module-level singleton) — safe to
call `predict()` repeatedly without reloading from disk.
