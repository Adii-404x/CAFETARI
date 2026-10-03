"""Demand inference using the best model selected by the chronological holdout."""
from __future__ import annotations

import argparse
import json
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"


def load_catalog():
    with (DATA_DIR / "item_catalog.json").open(encoding="utf-8") as source:
        return json.load(source)


def _scenario_factor(item: dict, scenario: str) -> float:
    name = item["name"].lower()
    category = item.get("category", "")
    if scenario == "rainy_monsoon":
        if "chai" in name or "samosa" in name:
            return 1.35
        if "cold" in name or "iced" in name:
            return 0.75
    elif scenario == "college_fest" and category in {"Snacks", "Beverages"}:
        return 1.3
    elif scenario == "exam_week":
        if "chai" in name or "coffee" in name:
            return 1.45
        if category == "Meals":
            return 0.85
    elif scenario == "sports_day":
        if category == "Beverages" or "roll" in name:
            return 1.25
    return 1.0


def _training_frame() -> pd.DataFrame:
    frame = pd.read_csv(DATA_DIR / "campus_orders_dataset.csv")
    frame["date"] = pd.to_datetime(frame["date"], errors="raise")
    frame["item_id"] = frame["item_id"].astype(str)
    return frame.sort_values(["date", "item_id"])


def predict_demand(target_date_str: str | None = None, scenario: str = "normal", model_bundle: dict | None = None,
                   custom_multiplier: float = 1.0):
    allowed_scenarios = {"normal", "rainy_monsoon", "college_fest", "exam_week", "sports_day"}
    if scenario not in allowed_scenarios:
        raise ValueError(f"Unsupported scenario. Choose one of: {', '.join(sorted(allowed_scenarios))}")
    if not 0.5 <= custom_multiplier <= 2.0:
        raise ValueError("customEventMultiplier must be between 0.5 and 2.0")
    target = date.fromisoformat(target_date_str) if target_date_str else date.today() + timedelta(days=1)
    if target < date.today() - timedelta(days=1):
        raise ValueError("Forecast date must be today or later")
    frame = _training_frame()
    catalog = load_catalog()
    estimator = model_bundle.get("best_estimator") if model_bundle else None
    metrics = model_bundle.get("metrics", []) if model_bundle else []
    selected = model_bundle.get("best_model_name", "Seasonal naive baseline") if model_bundle else "Seasonal naive baseline"
    holdout_mae = float(model_bundle.get("validation_mae", 0)) if model_bundle else 0
    error_band = int(model_bundle.get("validation_error_band", 0)) if model_bundle else 0

    dow = target.weekday()
    rows, total_portions, total_revenue = [], 0, 0.0
    scenario_labels = {
        "normal": "Typical campus day",
        "rainy_monsoon": "Monsoon scenario; hot drinks and fried snacks get a measured uplift",
        "college_fest": "Campus event scenario; snack and beverage demand receives an uplift",
        "exam_week": "Exam scenario; chai and coffee rise while sit-down meals soften",
        "sports_day": "Sports scenario; beverages and handheld rolls receive an uplift",
    }
    for item in catalog:
        item_id = str(item["id"])
        history = frame[frame["item_id"] == item_id].sort_values("date")
        if history.empty:
            history = frame[frame["item_name"].str.casefold() == item["name"].casefold()].sort_values("date")
        last_value = float(history["actual_demand"].tail(1).iloc[0]) if not history.empty else float(item.get("base_daily_demand", 0))
        same_weekday = history[history["date"].dt.dayofweek == dow]
        weekly_lag = float(same_weekday["actual_demand"].tail(1).iloc[0]) if not same_weekday.empty else last_value
        recent_mean = float(history["actual_demand"].tail(7).mean()) if not history.empty else last_value
        is_event = int(scenario in {"college_fest", "sports_day"})
        exam_season = int(scenario == "exam_week")
        row = {
            "item_id": item_id,
            "dow_sin": np.sin(2 * np.pi * dow / 7),
            "dow_cos": np.cos(2 * np.pi * dow / 7),
            "is_weekend": int(dow >= 5),
            "is_event": is_event,
            "exam_season": exam_season,
            "price": float(item.get("price", 0)),
            "prev_day_demand": last_value,
            "prev_week_demand": weekly_lag,
        }
        if estimator:
            prediction = float(estimator.predict(pd.DataFrame([row]))[0])
        else:
            # Explicit fallback when the data/model cannot be loaded; this is not presented as ML.
            prediction = 0.65 * weekly_lag + 0.35 * recent_mean
        quantity = max(0, int(round(max(0, prediction) * _scenario_factor(item, scenario) * custom_multiplier)))
        band = error_band if estimator else max(1, int(round(recent_mean * 0.2)))
        lower, upper = max(0, quantity - band), quantity + band
        price = float(item.get("price", 0))
        revenue = int(quantity * price)
        total_portions += quantity
        total_revenue += revenue
        rows.append({
            "foodItemId": item_id,
            "name": item["name"],
            "category": item.get("category", "Snacks"),
            "price": price,
            "predictedDemand": quantity,
            "historicalAvg": int(round(recent_mean)),
            "confidenceRange": [lower, upper],
            "bufferStock": int(np.ceil(quantity * 0.1)),
            "expectedRevenue": revenue,
            "prepRecommendation": "Small first batch; top up from live sales" if quantity < recent_mean * 0.85 else "Stage prep against forecast and review at midday",
        })
    rows.sort(key=lambda row: row["predictedDemand"], reverse=True)
    return {
        "date": target.isoformat(),
        "dayOfWeek": target.strftime("%A"),
        "scenario": scenario,
        "weatherCondition": scenario_labels[scenario],
        "totalExpectedPortions": total_portions,
        "totalProjectedRevenue": total_revenue,
        "predictions": rows,
        "selectedModel": selected,
        "modelsCompared": metrics,
        "modelVersion": "v3-chronological-holdout" if estimator else "v3-seasonal-fallback",
        "validationMae": holdout_mae if estimator else None,
        "validationErrorBand": error_band if estimator else None,
        "factorsConsidered": ["day of week", "weekend", "academic event scenario", "exam scenario", "recent per-item demand", "same-weekday demand", "menu item", "price"],
        "lastTrained": (model_bundle.get("metadata") or {}).get("trained_at") if model_bundle else None,
    }


def predict_kitchen_rush_hours(target_date_str: str | None = None):
    # There is no hourly transaction data yet, so keep this clearly labeled as a planning profile.
    profile = [("08:00 AM", 12, "Breakfast"), ("09:00 AM", 28, "Breakfast"), ("10:00 AM", 15, "Drinks"),
               ("11:00 AM", 22, "Snacks"), ("12:00 PM", 55, "Lunch"), ("01:00 PM", 85, "Lunch"),
               ("02:00 PM", 48, "Lunch"), ("03:00 PM", 18, "Restock"), ("04:00 PM", 35, "Tea and snacks"),
               ("05:00 PM", 78, "Tea and snacks"), ("06:00 PM", 50, "Snacks"), ("07:00 PM", 30, "Dinner"), ("08:00 PM", 25, "Dinner")]
    return {"status": "success", "source": "historical planning profile; hourly order logs are not connected",
            "hourlyData": [{"hour": hour, "orderVelocity": velocity, "focus": focus,
                            "rushLevel": "High" if velocity >= 50 else "Moderate" if velocity >= 25 else "Low",
                            "staffNeeded": max(1, int(np.ceil(velocity / 15)))} for hour, velocity, focus in profile]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date")
    parser.add_argument("--scenario", default="normal")
    args = parser.parse_args()
    print(json.dumps(predict_demand(args.date, args.scenario), indent=2))
