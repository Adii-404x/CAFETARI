"""
FastAPI Microservice for AI Demand Predictions
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from src.train import train_and_compare_models
from src.predict import generate_item_predictions

app = FastAPI(
    title="CafeteriaAI ML Service",
    description="Machine Learning Demand Forecasting & Food Waste Optimization API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global trained model cache
trained_model_cache = None

@app.on_event("startup")
def startup_event():
    global trained_model_cache
    print("Training ML demand regression ensemble on startup...")
    trained_model_cache = train_and_compare_models()
    print(f"ML Pipeline ready. Selected model: {trained_model_cache['selected_model_name']}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CafeteriaAI-ML-Engine",
        "modelLoaded": trained_model_cache is not None
    }

@app.post("/train")
def trigger_training():
    global trained_model_cache
    trained_model_cache = train_and_compare_models()
    return {
        "success": True,
        "message": "Model retrained and evaluated successfully",
        "selectedModel": trained_model_cache["selected_model_name"],
        "metrics": trained_model_cache["metrics"]
    }

@app.get("/predict")
def predict_demand(date: Optional[str] = Query(None, description="Target forecast date (YYYY-MM-DD)")):
    global trained_model_cache
    if trained_model_cache is None:
        trained_model_cache = train_and_compare_models()
        
    try:
        results = generate_item_predictions(trained_model_cache, date)
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
