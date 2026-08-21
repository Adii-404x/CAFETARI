"""
Model Training & Comparison Pipeline (Random Forest vs Gradient Boosting vs Linear Regression)
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from .preprocess import extract_features_from_df, generate_synthetic_history
from .evaluation import evaluate_model

def train_and_compare_models():
    df = generate_synthetic_history(days=90)
    df = extract_features_from_df(df)
    
    feature_cols = ['day_of_week', 'is_weekend', 'is_event', 'price', 'prep_time']
    X = df[feature_cols].values
    y = df['demand'].values
    
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 1. Random Forest
    rf = RandomForestRegressor(n_estimators=50, random_state=42)
    rf.fit(X_train, y_train)
    rf_metrics = evaluate_model(y_val, rf.predict(X_val), 'Random Forest Regressor')
    
    # 2. Gradient Boosting
    gb = GradientBoostingRegressor(n_estimators=40, learning_rate=0.1, random_state=42)
    gb.fit(X_train, y_train)
    gb_metrics = evaluate_model(y_val, gb.predict(X_val), 'Gradient Boosting Regressor')
    
    # 3. Ridge Regression
    lr = Ridge(alpha=1.0)
    lr.fit(X_train, y_train)
    lr_metrics = evaluate_model(y_val, lr.predict(X_val), 'Ridge Linear Regression')
    
    all_metrics = [rf_metrics, gb_metrics, lr_metrics]
    best_model_metric = min(all_metrics, key=lambda x: x['mae'])
    
    best_estimator = rf if best_model_metric['model_name'] == 'Random Forest Regressor' else (
        gb if best_model_metric['model_name'] == 'Gradient Boosting Regressor' else lr
    )
    
    return {
        'best_model': best_estimator,
        'selected_model_name': best_model_metric['model_name'],
        'metrics': all_metrics
    }
