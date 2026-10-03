"""
preprocess.py — shared preprocessing pipeline for OptiManufacture

Handles: missing values, categorical target encoding, numeric scaling,
train/test split. Used by both train.py and predict.py so that training
and inference stay perfectly consistent.
"""

from __future__ import annotations

import logging
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("preprocess")

TARGET = "efficiency_category"

FEATURE_COLS = [
    "production_time",
    "machine_utilization",
    "energy_consumption",
    "material_usage",
    "downtime",
    "worker_count",
    "defect_rate",
    "maintenance_frequency",
    "inventory_level",
]


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Drop duplicates and impute missing numeric values with the median."""
    df = df.drop_duplicates().copy()
    for col in FEATURE_COLS:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
    return df


def split_and_scale(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, StandardScaler, LabelEncoder]:
    """Clean, encode target, scale features, and split into train/test."""
    df = clean(df)

    encoder = LabelEncoder()
    y = encoder.fit_transform(df[TARGET])
    X = df[FEATURE_COLS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    logger.info("Train shape: %s | Test shape: %s", X_train_scaled.shape, X_test_scaled.shape)
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, encoder


def transform_single(record: dict, scaler: StandardScaler) -> np.ndarray:
    """Turn a single JSON-style record into a scaled feature row for inference."""
    row = pd.DataFrame([{col: record[col] for col in FEATURE_COLS}])
    return scaler.transform(row)
