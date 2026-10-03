"""
eda.py — Exploratory Data Analysis for OptiManufacture

Run:
    python eda.py
Outputs:
    Console summary (overview, missing values, duplicates, dtypes)
    Plots saved to ../images/
"""

import logging
import os
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("eda")

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

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "manufacturing_data.csv")
IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "images")
os.makedirs(IMG_DIR, exist_ok=True)

TARGET = "efficiency_category"


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    logger.info("Loaded dataset with shape %s", df.shape)
    return df


def overview(df: pd.DataFrame) -> None:
    print("\n=== Dataset Overview ===")
    print(df.head())
    print("\nShape:", df.shape)
    print("\n=== Data Types ===")
    print(df.dtypes)
    print("\n=== Missing Values ===")
    print(df.isnull().sum())
    print("\nDuplicate rows:", df.duplicated().sum())
    print("\n=== Class Distribution ===")
    print(df[TARGET].value_counts())
    print("\n=== Numeric Summary ===")
    print(df.describe())


def clean(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    logger.info("Removed %d duplicate rows", before - len(df))

    num_cols = df.select_dtypes(include="number").columns
    for col in num_cols:
        n_missing = df[col].isnull().sum()
        if n_missing:
            median = df[col].median()
            df[col] = df[col].fillna(median)
            logger.info("Filled %d missing values in '%s' with median %.2f",
                        n_missing, col, median)
    return df


def plots(df: pd.DataFrame) -> None:
    if not PLOTTING_AVAILABLE:
        logger.warning("Skipping EDA plots generation because plotting libraries (matplotlib/seaborn) failed to load.")
        return

    num_cols = df.select_dtypes(include="number").columns.tolist()

    # Correlation heatmap
    plt.figure(figsize=(9, 7))
    sns.heatmap(df[num_cols].corr(), annot=True, fmt=".2f", cmap="Blues")
    plt.title("Feature Correlation Heatmap")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "correlation_heatmap.png"), dpi=120)
    plt.close()

    # Class distribution
    plt.figure(figsize=(6, 4))
    order = ["Low", "Moderate", "High", "Optimal"]
    sns.countplot(data=df, x=TARGET, order=order, palette="Blues_d")
    plt.title("Efficiency Category Distribution")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "class_distribution.png"), dpi=120)
    plt.close()

    # Histograms
    df[num_cols].hist(figsize=(14, 10), bins=30, color="#3B82F6", edgecolor="white")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "histograms.png"), dpi=120)
    plt.close()

    # Boxplots (feature vs target) — first 4 features as an example
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    for ax, col in zip(axes.flat, num_cols[:4]):
        sns.boxplot(data=df, x=TARGET, y=col, order=order, ax=ax, palette="Blues")
        ax.set_title(f"{col} by efficiency category")
    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, "boxplots.png"), dpi=120)
    plt.close()

    logger.info("Saved EDA plots to %s", IMG_DIR)


if __name__ == "__main__":
    data = load_data()
    overview(data)
    data = clean(data)
    plots(data)
    data.to_csv(os.path.join(os.path.dirname(__file__), "data", "manufacturing_data_clean.csv"), index=False)
    logger.info("Saved cleaned dataset -> manufacturing_data_clean.csv")
