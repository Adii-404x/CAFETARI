"""Train and evaluate reproducible cafeteria demand models.

The validation window is always the latest set of dates. This mirrors the
forecasting task and avoids the optimistic leakage caused by random row splits.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "campus_orders_dataset.csv"
CATALOG_PATH = ROOT / "data" / "item_catalog.json"
MODELS_DIR = ROOT / "models"
CATEGORICAL = ["item_id"]
NUMERIC = ["dow_sin", "dow_cos", "is_weekend", "is_event", "exam_season", "price", "prev_day_demand", "prev_week_demand"]


def load_history() -> pd.DataFrame:
    frame = pd.read_csv(DATA_PATH)
    required = {"date", "item_id", "price", "actual_demand"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Training data is missing required columns: {', '.join(sorted(missing))}")
    frame["date"] = pd.to_datetime(frame["date"], errors="raise")
    frame["item_id"] = frame["item_id"].astype(str)
    frame = frame.sort_values(["date", "item_id"]).drop_duplicates(["date", "item_id"], keep="last")
    dow = frame["date"].dt.dayofweek
    frame["dow_sin"] = np.sin(2 * np.pi * dow / 7)
    frame["dow_cos"] = np.cos(2 * np.pi * dow / 7)
    frame["is_weekend"] = (dow >= 5).astype(int)
    for col, default in (("is_event", 0), ("exam_season", 0), ("prev_day_demand", np.nan), ("prev_week_demand", np.nan)):
        if col not in frame:
            frame[col] = default
    # Build missing lags per item; never let one menu item's demand bleed into another.
    grouped = frame.groupby("item_id", sort=False)["actual_demand"]
    frame["prev_day_demand"] = frame["prev_day_demand"].fillna(grouped.shift(1))
    frame["prev_week_demand"] = frame["prev_week_demand"].fillna(grouped.shift(7))
    for col in ("prev_day_demand", "prev_week_demand"):
        frame[col] = frame.groupby("item_id", sort=False)[col].transform(lambda values: values.bfill().ffill())
    frame[NUMERIC] = frame[NUMERIC].replace([np.inf, -np.inf], np.nan).fillna(0)
    frame["actual_demand"] = pd.to_numeric(frame["actual_demand"], errors="coerce")
    return frame.dropna(subset=["actual_demand"])


def _metrics(actual: np.ndarray, predicted: np.ndarray, name: str) -> dict:
    mae = float(mean_absolute_error(actual, predicted))
    return {
        "name": name,
        "mae": round(mae, 2),
        "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 2),
        "r2Score": round(float(r2_score(actual, predicted)), 3) if len(actual) > 1 else 0.0,
        "mape": round(float(np.mean(np.abs(actual - predicted) / np.maximum(actual, 1)) * 100), 2),
        "accuracyPercent": round(max(0.0, 100.0 * (1.0 - mae / max(float(np.mean(actual)), 1.0))), 1),
        "isBest": False,
    }


def train_and_evaluate_all() -> dict:
    frame = load_history()
    dates = np.array(sorted(frame["date"].unique()))
    if len(dates) < 5:
        raise ValueError("At least five distinct training dates are needed for a time-based holdout.")
    holdout_days = max(1, min(len(dates) // 5, 14))
    cutoff = dates[-holdout_days]
    train = frame[frame["date"] < cutoff]
    valid = frame[frame["date"] >= cutoff]
    if train.empty or valid.empty:
        raise ValueError("Could not form a chronological training and validation split.")

    model_specs = {
        "Hist Gradient Boosting": HistGradientBoostingRegressor(max_iter=120, learning_rate=0.06, l2_regularization=2.0, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=120, min_samples_leaf=3, max_features=0.9, n_jobs=-1, random_state=42),
        "Ridge Regression": Ridge(alpha=4.0),
    }
    metrics, error_bands = [], {}
    for name, estimator in model_specs.items():
        prep = ColumnTransformer([
            ("item", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
            ("numeric", StandardScaler() if name == "Ridge Regression" else "passthrough", NUMERIC),
        ])
        model = Pipeline([("features", prep), ("regressor", estimator)])
        model.fit(train[CATEGORICAL + NUMERIC], train["actual_demand"])
        holdout_predictions = model.predict(valid[CATEGORICAL + NUMERIC])
        scores = _metrics(valid["actual_demand"].to_numpy(), holdout_predictions, name)
        error_bands[name] = int(np.ceil(np.quantile(np.abs(valid["actual_demand"].to_numpy() - holdout_predictions), 0.9)))
        metrics.append(scores)

    best = min(metrics, key=lambda item: item["mae"])
    best["isBest"] = True
    # Refit the selected pipeline on all available observations for tomorrow's forecast.
    final_prep = ColumnTransformer([
        ("item", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
        ("numeric", StandardScaler() if best["name"] == "Ridge Regression" else "passthrough", NUMERIC),
    ])
    final_model = Pipeline([("features", final_prep), ("regressor", model_specs[best["name"]])])
    final_model.fit(frame[CATEGORICAL + NUMERIC], frame["actual_demand"])

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    metadata = {
        "model_name": best["name"],
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_samples": int(len(train)),
        "validation_samples": int(len(valid)),
        "validation_start": str(pd.Timestamp(cutoff).date()),
        "validation_end": str(pd.Timestamp(dates[-1]).date()),
        "validation_method": "chronological holdout",
        "selected_model_metrics": best,
        "holdout_abs_error_p90": error_bands[best["name"]],
        "all_models_compared": metrics,
        "features_used": CATEGORICAL + NUMERIC,
    }
    (MODELS_DIR / "demand_forecast_model.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return {"best_estimator": final_model, "best_model_name": best["name"], "metrics": metrics,
            "features": CATEGORICAL + NUMERIC, "validation_mae": best["mae"],
            "validation_error_band": error_bands[best["name"]], "metadata": metadata}


if __name__ == "__main__":
    result = train_and_evaluate_all()
    print(f"Selected {result['best_model_name']} — holdout MAE {result['validation_mae']} portions")
