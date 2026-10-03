"""
generate_data.py
-----------------
Generates a synthetic manufacturing production dataset that mirrors the
schema described for the OptiManufacture project (based on the structure
of the Kaggle "manufacturing-production-data" dataset, since the sandbox
used to build this pipeline has no internet access to download the
original file directly).

Swap this file out for the real Kaggle CSV later — just make sure the
column names in preprocess.py / train.py match, or update TARGET_COL /
FEATURE_COLS there.

Run:
    python generate_data.py
Produces:
    manufacturing_data.csv  (5000 rows)
"""

import os
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
N = 5000


def generate() -> pd.DataFrame:
    production_time = RNG.normal(8, 2, N).clip(2, 16)              # hours
    machine_utilization = RNG.normal(75, 15, N).clip(20, 100)      # %
    energy_consumption = RNG.normal(500, 120, N).clip(100, 1200)   # kWh
    material_usage = RNG.normal(300, 80, N).clip(50, 700)          # kg
    downtime = RNG.exponential(2, N).clip(0, 12)                   # hours
    worker_count = RNG.integers(5, 60, N)                          # count
    defect_rate = RNG.exponential(3, N).clip(0, 25)                # %
    maintenance_frequency = RNG.integers(0, 10, N)                 # per month
    inventory_level = RNG.normal(400, 150, N).clip(20, 1000)       # units

    # A few missing values and a handful of duplicate rows, to make the
    # EDA / cleaning steps meaningful.
    df = pd.DataFrame({
        "production_time": production_time,
        "machine_utilization": machine_utilization,
        "energy_consumption": energy_consumption,
        "material_usage": material_usage,
        "downtime": downtime,
        "worker_count": worker_count,
        "defect_rate": defect_rate,
        "maintenance_frequency": maintenance_frequency,
        "inventory_level": inventory_level,
    })

    # ---- build a latent "efficiency score" from the features so the
    # ---- target is actually learnable rather than pure noise ----
    score = (
        0.9 * (df["machine_utilization"] / 100)
        - 0.7 * (df["downtime"] / df["downtime"].max())
        - 0.6 * (df["defect_rate"] / df["defect_rate"].max())
        + 0.4 * (df["maintenance_frequency"] / df["maintenance_frequency"].max())
        - 0.3 * (df["energy_consumption"] / df["energy_consumption"].max())
        + 0.3 * (df["worker_count"] / df["worker_count"].max())
        + 0.2 * (df["inventory_level"] / df["inventory_level"].max())
        + RNG.normal(0, 0.01, N)  # noise
    )

    q1, q2, q3 = np.quantile(score, [0.25, 0.5, 0.75])

    def bucket(s):
        if s <= q1:
            return "Low"
        elif s <= q2:
            return "Moderate"
        elif s <= q3:
            return "High"
        else:
            return "Optimal"

    df["efficiency_category"] = score.apply(bucket) if hasattr(score, "apply") else [bucket(s) for s in score]

    # inject missing values (~1.5% of cells across a few columns)
    for col in ["energy_consumption", "defect_rate", "inventory_level"]:
        idx = RNG.choice(N, size=int(N * 0.015), replace=False)
        df.loc[idx, col] = np.nan

    # inject duplicate rows
    dup_idx = RNG.choice(N, size=40, replace=False)
    df = pd.concat([df, df.loc[dup_idx]], ignore_index=True)

    return df.sample(frac=1, random_state=42).reset_index(drop=True)


if __name__ == "__main__":
    data = generate()
    base_dir = os.path.dirname(__file__)
    data.to_csv(os.path.join(base_dir, "manufacturing_data.csv"), index=False)
    print(f"Saved {len(data)} rows -> manufacturing_data.csv")
    print(data["efficiency_category"].value_counts())
