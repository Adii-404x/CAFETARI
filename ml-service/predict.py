"""
CafeteriaAI Prediction & Multi-Feature Inference Engine
"""
import os
import json
import argparse
from datetime import datetime, timedelta
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_catalog():
    catalog_path = os.path.join(DATA_DIR, 'item_catalog.json')
    if os.path.exists(catalog_path):
        with open(catalog_path, 'r') as f:
            return json.load(f)
    return [
        {"id": "food-1", "name": "Masala Dosa", "category": "Breakfast", "price": 65, "prep_time_minutes": 8, "base_daily_demand": 60},
        {"id": "food-2", "name": "Crispy Samosa (2 pcs)", "category": "Snacks", "price": 30, "prep_time_minutes": 5, "base_daily_demand": 110},
        {"id": "food-3", "name": "Classic Veg Burger", "category": "Snacks", "price": 75, "prep_time_minutes": 10, "base_daily_demand": 75},
        {"id": "food-4", "name": "Thick Cold Coffee", "category": "Beverages", "price": 50, "prep_time_minutes": 4, "base_daily_demand": 120},
        {"id": "food-5", "name": "Adrak Elaichi Chai", "category": "Beverages", "price": 20, "prep_time_minutes": 3, "base_daily_demand": 190},
        {"id": "food-6", "name": "Executive Veg Thali", "category": "Meals", "price": 130, "prep_time_minutes": 12, "base_daily_demand": 55},
        {"id": "food-7", "name": "Paneer Tikka Roll", "category": "Snacks", "price": 90, "prep_time_minutes": 8, "base_daily_demand": 68},
        {"id": "food-8", "name": "Chole Bhature Platter", "category": "Meals", "price": 110, "prep_time_minutes": 12, "base_daily_demand": 50},
        {"id": "food-9", "name": "Peri Peri French Fries", "category": "Snacks", "price": 60, "prep_time_minutes": 6, "base_daily_demand": 80},
        {"id": "food-10", "name": "Warm Fudge Brownie", "category": "Desserts", "price": 65, "prep_time_minutes": 3, "base_daily_demand": 45}
    ]

def predict_demand(target_date_str: str = None, scenario: str = "normal"):
    """
    Inference for item portion demand with scenario simulation
    Scenarios: 'normal', 'rainy_monsoon', 'college_fest', 'exam_week', 'sports_day'
    """
    if not target_date_str:
        target_date = datetime.now() + timedelta(days=1)
    else:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d')
        
    dow = target_date.weekday()
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_name = day_names[dow]
    is_weekend = 1 if dow in [5, 6] else 0
    
    # Base multiplier by day
    day_mult = 1.35 if dow == 0 else (1.25 if dow == 4 else (0.55 if is_weekend else 1.0))
    
    # Scenario modifiers
    scenario_mult = 1.0
    weather_desc = "Normal Campus Weather (Sunny/Pleasant)"
    
    if scenario == "rainy_monsoon":
        scenario_mult = 1.15
        weather_desc = "Monsoon Rain (Hot beverages & fried snacks +35% surge, cold drinks -25%)"
    elif scenario == "college_fest":
        scenario_mult = 1.65
        weather_desc = "Annual Campus Fest (High student influx & grab-and-go demand +65%)"
    elif scenario == "exam_week":
        scenario_mult = 0.90
        weather_desc = "Mid-Term / Final Exam Week (Night chai & coffee +50%, sit-down meals -20%)"
    elif scenario == "sports_day":
        scenario_mult = 1.40
        weather_desc = "Inter-College Sports Tournament (High beverage & high-protein roll demand)"
        
    catalog = load_catalog()
    predictions = []
    total_portions = 0
    total_revenue = 0
    
    for item in catalog:
        base = item.get('base_daily_demand', 50)
        cat = item.get('category', 'Snacks')
        
        cat_bonus = 1.0
        if scenario == "rainy_monsoon":
            if cat in ['Beverages', 'Snacks'] and 'Chai' in item['name'] or 'Samosa' in item['name']:
                cat_bonus = 1.45
            elif 'Cold' in item['name']:
                cat_bonus = 0.70
        elif scenario == "exam_week":
            if cat == 'Beverages':
                cat_bonus = 1.40
        elif scenario == "college_fest":
            if cat in ['Snacks', 'Beverages']:
                cat_bonus = 1.70
                
        noise = (hash(item['name'] + target_date.strftime('%Y%m%d')) % 7) - 3
        predicted_qty = max(12, int(round(base * day_mult * scenario_mult * cat_bonus + noise)))
        buffer_stock = int(np.ceil(predicted_qty * 0.12))
        lower_conf = max(10, int(predicted_qty * 0.88))
        upper_conf = int(predicted_qty * 1.15)
        item_rev = predicted_qty * item['price']
        
        total_portions += predicted_qty
        total_revenue += item_rev
        
        if predicted_qty > base * 1.25:
            prep_rec = "Prep +25% Early Morning Batch"
        elif predicted_qty < base * 0.8:
            prep_rec = "Reduce Early Batch; Cook on-demand"
        else:
            prep_rec = "Standard 2-Stage Batch Prep"
            
        predictions.append({
            'foodItemId': item['id'],
            'name': item['name'],
            'category': cat,
            'price': item['price'],
            'predictedDemand': predicted_qty,
            'historicalAvg': base,
            'confidenceRange': [lower_conf, upper_conf],
            'bufferStock': buffer_stock,
            'expectedRevenue': item_rev,
            'prepRecommendation': prep_rec
        })
        
    predictions.sort(key=lambda x: x['predictedDemand'], reverse=True)
    
    return {
        'date': target_date.strftime('%Y-%m-%d'),
        'dayOfWeek': day_name,
        'scenario': scenario,
        'weatherCondition': weather_desc,
        'totalExpectedPortions': total_portions,
        'totalProjectedRevenue': total_revenue,
        'predictions': predictions
    }

def predict_kitchen_rush_hours(target_date_str: str = None):
    """
    Predicts 24-hour crowd intensity and recommended staff allocation
    """
    hourly_distribution = [
        {"hour": "08:00 AM", "rushLevel": "Low", "orderVelocity": 12, "staffNeeded": 2, "focus": "Breakfast Dosa & Chai"},
        {"hour": "09:00 AM", "rushLevel": "Moderate", "orderVelocity": 28, "staffNeeded": 3, "focus": "Breakfast Peak"},
        {"hour": "10:00 AM", "rushLevel": "Low", "orderVelocity": 15, "staffNeeded": 2, "focus": "Mid-morning Beverages"},
        {"hour": "11:00 AM", "rushLevel": "Moderate", "orderVelocity": 22, "staffNeeded": 3, "focus": "Early Snacks & Rolls"},
        {"hour": "12:00 PM", "rushLevel": "High", "orderVelocity": 55, "staffNeeded": 5, "focus": "Pre-Lunch Thali Rush"},
        {"hour": "01:00 PM", "rushLevel": "Severe Peak", "orderVelocity": 85, "staffNeeded": 6, "focus": "Major Lunch Rush Hour"},
        {"hour": "02:00 PM", "rushLevel": "High", "orderVelocity": 48, "staffNeeded": 4, "focus": "Late Lunch & Cold Coffee"},
        {"hour": "03:00 PM", "rushLevel": "Low", "orderVelocity": 18, "staffNeeded": 2, "focus": "Kitchen Prep Clean & Restock"},
        {"hour": "04:00 PM", "rushLevel": "Moderate", "orderVelocity": 35, "staffNeeded": 3, "focus": "Evening Chai & Samosa Wave"},
        {"hour": "05:00 PM", "rushLevel": "Severe Peak", "orderVelocity": 78, "staffNeeded": 6, "focus": "Post-Lecture Tea & Snacks"},
        {"hour": "06:00 PM", "rushLevel": "High", "orderVelocity": 50, "staffNeeded": 4, "focus": "Burgers & Fries Hangout"},
        {"hour": "07:00 PM", "rushLevel": "Moderate", "orderVelocity": 30, "staffNeeded": 3, "focus": "Early Dinner Items"},
        {"hour": "08:00 PM", "rushLevel": "Moderate", "orderVelocity": 25, "staffNeeded": 3, "focus": "Dinner Meals & Desserts"}
    ]
    return {
        "status": "success",
        "peakWindows": ["12:30 PM - 02:00 PM (Lunch Wave)", "04:45 PM - 06:15 PM (Evening Snack Wave)"],
        "hourlyData": hourly_distribution
    }

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Predict Cafeteria Demand & Rush")
    parser.add_argument('--date', type=str, default=None, help="Date in YYYY-MM-DD")
    parser.add_argument('--scenario', type=str, default='normal', help="Scenario: normal, rainy_monsoon, college_fest, exam_week")
    args = parser.parse_args()
    
    result = predict_demand(args.date, args.scenario)
    print(json.dumps(result, indent=2))
