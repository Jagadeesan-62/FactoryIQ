"""
train.py — trains Logistic Regression, Decision Tree, and Random Forest,
compares them, and saves the best-performing model + preprocessing
artifacts for use by predict.py and the FastAPI backend.

Run:
    python train.py
Outputs (in models/):
    best_model.pkl
    scaler.pkl
    encoder.pkl
    metrics.json
Outputs (in ../images/):
    confusion_matrix_<model>.png for each model
    feature_importance.png
    model_comparison.png
"""

import json
import logging
import os
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.tree import DecisionTreeClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train")

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns
    # Force backend load to test DLL policy compatibility
    from matplotlib.backends._backend_agg import RendererAgg
    PLOTTING_AVAILABLE = True
except ImportError as e:
    PLOTTING_AVAILABLE = False
    logger.warning("Matplotlib/Seaborn plotting is unavailable (DLL load blocked by system policy): %s", e)

from preprocess import FEATURE_COLS, split_and_scale

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "manufacturing_data.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
IMG_DIR = os.path.join(BASE_DIR, "..", "images")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

MODELS = {
    "logistic_regression": LogisticRegression(max_iter=1000),
    "decision_tree": DecisionTreeClassifier(max_depth=8, random_state=42),
    "random_forest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42),
    "gradient_boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
}


def evaluate(name, model, X_test, y_test, class_names):
    preds = model.predict(X_test)
    metrics = {
        "accuracy": accuracy_score(y_test, preds),
        "precision": precision_score(y_test, preds, average="weighted", zero_division=0),
        "recall": recall_score(y_test, preds, average="weighted", zero_division=0),
        "f1_score": f1_score(y_test, preds, average="weighted", zero_division=0),
    }

    if PLOTTING_AVAILABLE:
        cm = confusion_matrix(y_test, preds)
        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                    xticklabels=class_names, yticklabels=class_names)
        plt.title(f"Confusion Matrix — {name}")
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.tight_layout()
        plt.savefig(os.path.join(IMG_DIR, f"confusion_matrix_{name}.png"), dpi=120)
        plt.close()
    else:
        logger.warning("[%s] Skipping confusion matrix plot generation.", name)

    logger.info("[%s] accuracy=%.4f precision=%.4f recall=%.4f f1=%.4f",
                name, metrics["accuracy"], metrics["precision"], metrics["recall"], metrics["f1_score"])
    return metrics


def plot_comparison(results: dict):
    if not PLOTTING_AVAILABLE:
        logger.warning("Skipping model comparison plot generation.")
        return
    df = pd.DataFrame(results).T
    df.plot(kind="bar", figsize=(9, 5), colormap="Blues_r")
    plt.title("Model Comparison")
    plt.ylabel("Score")
    plt.ylim(0, 1)
    plt.xticks(rotation=15)
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "model_comparison.png"), dpi=120)
    plt.close()


def plot_feature_importance(model, model_name):
    if not PLOTTING_AVAILABLE:
        logger.warning("Skipping feature importance plot generation.")
        return
    if not hasattr(model, "feature_importances_"):
        return
    importances = pd.Series(model.feature_importances_, index=FEATURE_COLS).sort_values()
    plt.figure(figsize=(8, 6))
    importances.plot(kind="barh", color="#2563EB")
    plt.title(f"Feature Importance — {model_name}")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "feature_importance.png"), dpi=120)
    plt.close()


def main():
    df = pd.read_csv(DATA_PATH)
    X_train, X_test, y_train, y_test, scaler, encoder = split_and_scale(df)
    class_names = list(encoder.classes_)

    results = {}
    fitted = {}

    for name, model in MODELS.items():
        logger.info("Training %s ...", name)
        model.fit(X_train, y_train)
        fitted[name] = model
        results[name] = evaluate(name, model, X_test, y_test, class_names)

    plot_comparison(results)

    best_name = max(results, key=lambda n: results[n]["f1_score"])
    best_model = fitted[best_name]
    logger.info("Best model: %s (f1=%.4f)", best_name, results[best_name]["f1_score"])

    plot_feature_importance(best_model, best_name)

    joblib.dump(best_model, os.path.join(MODELS_DIR, "best_model.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
    joblib.dump(encoder, os.path.join(MODELS_DIR, "encoder.pkl"))

    with open(os.path.join(MODELS_DIR, "metrics.json"), "w") as f:
        json.dump({
            "best_model": best_name,
            "results": results,
            "feature_columns": FEATURE_COLS,
            "class_names": class_names,
        }, f, indent=2)

    logger.info("Saved best_model.pkl, scaler.pkl, encoder.pkl, metrics.json -> %s", MODELS_DIR)


if __name__ == "__main__":
    main()
