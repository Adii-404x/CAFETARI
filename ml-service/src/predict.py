"""
Prediction Inference Engine
"""
from datetime import datetime, timedelta
import numpy as np

def generate_item_predictions(model_info, target_date_str: str = None):
    model = model_info['best_model']
    
    if not target_date_str:
        target_date = datetime.now() + timedelta(days=1)
    else:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d')
        
    dow = target_date.weekday()
    is_weekend = 1 if dow in [5, 6] else 0
    is_event = 1 if target_date.day % 7 == 0 else 0
    
    catalog = [
        {'item': 'Samosa', 'category': 'Snacks', 'price': 30, 'prep_time': 5, 'base': 75},
        {'item': 'Masala Dosa', 'category': 'Breakfast', 'price': 65, 'prep_time': 10, 'base': 55},
        {'item': 'Veg Burger', 'category': 'Snacks', 'price': 75, 'prep_time': 12, 'base': 60},
        {'item': 'Cold Coffee', 'category': 'Beverages', 'price': 50, 'prep_time': 4, 'base': 95},
        {'item': 'Masala Chai', 'category': 'Beverages', 'price': 20, 'prep_time': 3, 'base': 140},
        {'item': 'Veg Thali', 'category': 'Meals', 'price': 130, 'prep_time': 10, 'base': 48},
        {'item': 'Paneer Roll', 'category': 'Snacks', 'price': 90, 'prep_time': 8, 'base': 42},
        {'item': 'Chole Bhature', 'category': 'Meals', 'price': 110, 'prep_time': 12, 'base': 38},
        {'item': 'French Fries', 'category': 'Snacks', 'price': 60, 'prep_time': 6, 'base': 50},
        {'item': 'Brownie Fudge', 'category': 'Desserts', 'price': 65, 'prep_time': 4, 'base': 32}
    ]
    
    predictions = []
    total_portions = 0
    
    for item in catalog:
        features = np.array([[dow, is_weekend, is_event, item['price'], item['prep_time']]])
        pred = model.predict(features)[0]
        portions = max(15, int(round(pred)))
        total_portions += portions
        
        predictions.append({
            'item': item['item'],
            'category': item['category'],
            'predictedDemand': portions,
            'bufferStock': int(np.ceil(portions * 0.12)),
            'prepRecommendation': 'Prep +20% Morning Batch' if portions > item['base'] else 'Standard Batch'
        })
        
    return {
        'date': target_date.strftime('%Y-%m-%d'),
        'dayOfWeek': target_date.strftime('%A'),
        'selectedModel': model_info['selected_model_name'],
        'modelsCompared': model_info['metrics'],
        'totalExpectedPortions': total_portions,
        'predictions': predictions
    }
