# CAFETARI

Campus food ordering with student, kitchen, and administrator views. The frontend and Express API run together on port 3000; Socket.IO provides live order updates. MongoDB is optional for local use: without `MONGODB_URI`, data is stored in `./data/cafeteria_db.json`.

## Run locally

1. Install Node.js 20 or newer and npm.
2. Copy `.env.example` to `.env` and set a private `JWT_ACCESS_SECRET` for any shared or deployed environment. MongoDB and Gemini keys are optional.
3. Run `npm install`, then `npm run dev`.
4. Open `http://localhost:3000`.

The landing page has one-click student, staff, and admin demo entry points. Demo actions and local JSON storage are for evaluation and single-machine development, not a multi-user production database. For a shared deployment, configure MongoDB, a strong secret, and HTTPS.

## Demand forecasting service

The optional Python service provides a trained scikit-learn forecast at `ml-service/`. It uses the supplied campus order history, one-hot encodes menu item IDs, creates per-item lag features, compares a histogram gradient booster, random forest, and ridge model, and selects by MAE on the latest chronological date window. It reports holdout error and saves training metadata to `ml-service/models/demand_forecast_model.json`.

```powershell
cd ml-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Set `CLIENT_ORIGINS` to a comma-separated list of allowed browser origins when hosting the service separately. Its default allows local ports 3000 and 5173. Check `/health` for readiness and the selected model. `/predict/demand?date=YYYY-MM-DD&scenario=normal` forecasts demand; supported scenarios are `normal`, `rainy_monsoon`, `college_fest`, `exam_week`, and `sports_day`.

To have the Express API use this service instead of its local preview model, set `ML_SERVICE_URL=http://localhost:8000` in the project `.env` and restart the web server.

Forecasts are planning estimates, not guarantees. The supplied CSV is small and synthetic; replace it with timestamped real orders and known event/calendar inputs before using the forecasts for purchasing. Hourly rush figures remain a planning profile until hourly order logs are collected. The React app can run without this service and clearly labels its browser fallback as demo history.

## Useful commands

- `npm run dev` — start the full-stack development server
- `npm run build` — type-check and create production bundles
- `npm start` — serve a completed production build

Keep `.env`, local database files, and real customer data out of version control.
