"""
Data Preprocessing & Feature Engineering Module for Cafeteria Demand Forecasting
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

CATEGORY_WEIGHTS = {
    'Breakfast': 1.2,
    'Snacks': 1.8,
    'Meals': 1.5,
    'Beverages': 2.1,
    'Desserts': 0.9
}

def extract_features_from_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts time-series lags, cyclical calendar components, and domain features
    """
    df = df.copy()
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
    
    if 'category' in df.columns:
        df['category_weight'] = df['category'].map(lambda c: CATEGORY_WEIGHTS.get(c, 1.0))
        
    return df

def generate_synthetic_history(days: int = 60) -> pd.DataFrame:
    """
    Generates historical cafeteria demand data with realistic seasonal variation
    """
    items = [
        ('Samosa', 'Snacks', 30, 75, 5),
        ('Masala Dosa', 'Breakfast', 65, 55, 10),
        ('Veg Burger', 'Snacks', 75, 60, 12),
        ('Cold Coffee', 'Beverages', 50, 95, 4),
        ('Masala Chai', 'Beverages', 20, 140, 3),
        ('Veg Thali', 'Meals', 130, 48, 10),
        ('Paneer Roll', 'Snacks', 90, 42, 8),
        ('Chole Bhature', 'Meals', 110, 38, 12),
        ('French Fries', 'Snacks', 60, 50, 6),
        ('Brownie Fudge', 'Desserts', 65, 32, 4)
    ]
    
    records = []
    base_date = datetime.now() - timedelta(days=days)
    
    for day_offset in range(days):
        current_date = base_date + timedelta(days=day_offset)
        dow = current_date.weekday()
        is_weekend = 1 if dow in [5, 6] else 0
        is_event = 1 if (day_offset % 10 == 0) else 0
        
        for name, category, price, base_qty, prep_time in items:
            multiplier = 1.0
            if dow == 0: multiplier = 1.35 # Monday spike
            elif dow == 4: multiplier = 1.25 # Friday rush
            elif is_weekend: multiplier = 0.50 # Low weekend traffic
            
            if is_event: multiplier *= 1.45
            
            cat_weight = CATEGORY_WEIGHTS.get(category, 1.0)
            noise = np.random.normal(0, 4)
            actual_demand = max(10, int(base_qty * multiplier * (cat_weight / 1.5) + noise))
            
            records.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'item_name': name,
                'category': category,
                'price': price,
                'prep_time': prep_time,
                'day_of_week': dow,
                'is_weekend': is_weekend,
                'is_event': is_event,
                'demand': actual_demand
            })
            
    return pd.DataFrame(records)
