# 🧠 CafeteriaAI ML Intelligence Service

The AI/ML microservice powering **CAFETARI** campus dining operations. It predicts kitchen demand, optimizes preparation batches, forecasts peak crowd rush hours, minimizes perishable food waste, and provides smart dynamic combos for students.

---

## 📁 Architecture Directory Layout

```
ml-service/
├── data/
│   ├── campus_orders_dataset.csv     # Historical order logs with cyclical & weather features
│   ├── food_ingredients_bom.json     # Bill of materials & stock thresholds
│   ├── item_catalog.json             # Menu catalog metadata
│   └── student_order_associations.csv# Association matrix for cross-sell recommendations
├── models/
│   ├── demand_forecast_model.json    # Serialized Gradient Boosting / Random Forest parameters
│   ├── ingredient_depletion_model.json# Stockout prediction parameters
│   ├── queue_wait_time_model.json    # Kitchen queue bottleneck regression model
│   └── smart_combo_recommender.json  # Apriori Association Rules matrix
├── src/                              # Helper preprocessing & evaluation modules
├── train.py                          # Multi-model training, K-Fold CV & benchmark pipeline
├── predict.py                        # Multi-scenario inference engine
├── app.py                            # High-throughput FastAPI REST Microservice
└── requirements.txt                  # Python dependencies
```

---

## 🚀 Key Machine Learning Models & Capabilities

1. **Demand Forecasting Ensemble**:
   - Compares **Gradient Boosting Regressor**, **Random Forest Regressor**, **Ridge Regression**, and **Linear Regression**.
   - Evaluates on **MAE**, **RMSE**, **R² Score**, and **MAPE** using 5-Fold Cross Validation.
   - Selects the optimal model dynamically based on minimum validation error.

2. **Scenario Simulator Engine**:
   - `normal`: Standard campus weekday schedule.
   - `rainy_monsoon`: Simulates hot beverages & fried snacks surging +35%, cold drinks decreasing -25%.
   - `college_fest`: Simulates campus event traffic surging +65% for grab-and-go items.
   - `exam_week`: Simulates late-night chai/coffee surges (+50%) and reduced sit-down thali orders.
   - `sports_day`: High hydration & protein snack surge.

3. **Smart Cross-Selling & Basket Recommendations**:
   - Implements **Apriori Association Rule Mining** (Confidence > 0.60, Lift > 1.5).
   - Generates contextual cart add-ons with automatic campus bundle savings.

4. **Kitchen Rush & Staffing Allocator**:
   - Hour-by-hour order velocity forecasting (e.g. 1:00 PM Lunch Peak & 5:00 PM Evening Snack Rush).
   - Recommended cook and counter staff allocations.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train & Evaluate Models
```bash
python train.py --save-artifacts
```

### 3. Run Predictions in Terminal
```bash
python predict.py --date 2026-08-24 --scenario college_fest
```

### 4. Start FastAPI Server
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
