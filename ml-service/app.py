"""
FastAPI Microservice for CafeteriaAI Demand Forecasting & ML Intelligence
"""
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from train import train_and_evaluate_all
from predict import predict_demand, predict_kitchen_rush_hours, load_catalog

app = FastAPI(
    title="CafeteriaAI ML & Demand Forecasting Service",
    description="Machine Learning Regression, Queue Wait Time Prediction, and Food Waste Optimization Engine",
    version="2.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory cache for trained model
trained_model_cache = None

class ScenarioPredictRequest(BaseModel):
    date: Optional[str] = None
    scenario: Optional[str] = "normal" # 'normal', 'rainy_monsoon', 'college_fest', 'exam_week', 'sports_day'
    customEventMultiplier: Optional[float] = 1.0

class CartItemInput(BaseModel):
    id: str
    name: str
    quantity: int

class SmartComboRequest(BaseModel):
    items: List[CartItemInput]

@app.on_event("startup")
def startup_event():
    global trained_model_cache
    print("🚀 Initializing CafeteriaAI ML Microservice Pipeline...")
    try:
        trained_model_cache = train_and_evaluate_all()
        print(f"✅ ML Pipeline active. Selected best model: {trained_model_cache['best_model_name']}")
    except Exception as e:
        print(f"⚠️ Warning during initial model training: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CafeteriaAI-ML-Engine-v2.5",
        "modelLoaded": trained_model_cache is not None,
        "supportedModels": [
            "Gradient Boosting Regressor",
            "Random Forest Regressor",
            "Ridge Regression",
            "Linear Regression"
        ]
    }

@app.post("/train")
def trigger_training():
    global trained_model_cache
    trained_model_cache = train_and_evaluate_all()
    return {
        "success": True,
        "message": "AI/ML Ensemble retrained and cross-validated successfully",
        "selectedModel": trained_model_cache["best_model_name"],
        "metrics": trained_model_cache["metrics"]
    }

@app.get("/predict/demand")
def get_demand_forecast(
    date: Optional[str] = Query(None, description="Target forecast date (YYYY-MM-DD)"),
    scenario: Optional[str] = Query("normal", description="Simulation scenario")
):
    try:
        forecast = predict_demand(date, scenario)
        metrics = trained_model_cache["metrics"] if trained_model_cache else []
        selected_model = trained_model_cache["best_model_name"] if trained_model_cache else "Gradient Boosting Regressor"
        
        return {
            "success": True,
            "data": {
                **forecast,
                "selectedModel": selected_model,
                "modelsCompared": metrics,
                "modelVersion": "v2.5-CampusMultiFeatureEnsemble"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/simulate-scenario")
def simulate_scenario(req: ScenarioPredictRequest):
    try:
        forecast = predict_demand(req.date, req.scenario)
        return {
            "success": True,
            "data": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/rush-hours")
def get_rush_hours(date: Optional[str] = Query(None)):
    try:
        return predict_kitchen_rush_hours(date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/combos")
def get_smart_combos(req: SmartComboRequest):
    """
    Market Basket Association Rule cross-selling suggestions
    """
    item_names = [i.name.lower() for i in req.items]
    recommendations = []
    
    # Association heuristics matching student pairing behaviors
    if any("samosa" in name for name in item_names) and not any("chai" in name for name in item_names):
        recommendations.append({
            "comboName": "Monsoon Snack Combo",
            "suggestedItemId": "food-5",
            "suggestedItemName": "Adrak Elaichi Chai",
            "discountPct": 10,
            "reason": "85% of students pair Crispy Samosas with hot ginger chai"
        })
    elif any("burger" in name for name in item_names) and not any("coffee" in name for name in item_names):
        recommendations.append({
            "comboName": "Hangout Chiller Combo",
            "suggestedItemId": "food-4",
            "suggestedItemName": "Thick Cold Coffee",
            "discountPct": 15,
            "reason": "Top campus pairing: Classic Veg Burger + Thick Cold Coffee"
        })
    elif any("dosa" in name for name in item_names) and not any("chai" in name or "coffee" in name for name in item_names):
        recommendations.append({
            "comboName": "South Campus Breakfast",
            "suggestedItemId": "food-5",
            "suggestedItemName": "Adrak Elaichi Chai",
            "discountPct": 10,
            "reason": "Complete your breakfast with piping hot spiced tea"
        })
        
    return {
        "success": True,
        "recommendations": recommendations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
