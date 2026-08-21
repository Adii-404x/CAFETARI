# CafeteriaAI — ML Food Demand Prediction Microservice

## Overview
This standalone Python microservice uses **Scikit-Learn, Pandas, and FastAPI** to forecast tomorrow's meal portion demands for the college cafeteria.

## Features
- **Multi-Model Comparison**: Evaluates Random Forest Regressor, Gradient Boosting Regressor, and Ridge Linear Regression on a validation holdout split.
- **Model Evaluation**: Calculates Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R² score.
- **Feature Engineering**: Incorporates day of week, weekend indicator, academic event flag, meal category weight, pricing, and historical moving averages.
- **Safety Buffers**: Automatically calculates a +12% safety margin for perishable prep planning.

## Running the Service
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## API Endpoints
- `GET /health` — Microservice health status
- `POST /train` — Re-train and evaluate regression models
- `GET /predict?date=YYYY-MM-DD` — Get demand forecasts for target date
