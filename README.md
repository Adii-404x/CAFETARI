# 🍽️ CafeteriaAI

> A Smart College Cafeteria Management System with AI-powered food demand prediction.

CafeteriaAI is a full-stack web application designed to streamline college cafeteria operations. Students can browse the menu, place orders, and track their order status, while cafeteria staff and administrators can manage orders, food items, and cafeteria analytics.

The system also includes an AI/ML-based food demand prediction module to help estimate future food demand and potentially reduce food wastage and shortages.

---

## ✨ Features

### 👨‍🎓 Student

* Secure registration and login
* Browse available food items
* Search and filter menu items
* Add items to cart
* Update item quantities
* Place orders
* Receive a unique order number
* Track order status
* View order history
* Submit ratings and feedback

### 👨‍🍳 Cafeteria Staff

* View incoming orders
* Manage active orders
* Update order status
* Mark food items as available or unavailable

### 🛠️ Admin

* Admin dashboard
* Manage food items
* Add, edit, and delete menu items
* View and manage all orders
* Monitor revenue and order statistics
* View popular food items
* Access cafeteria analytics
* View AI-powered food demand predictions

### 🤖 AI/ML

* Food demand prediction based on historical order data
* Demand forecasting for individual food items
* Data-driven insights for cafeteria management

---

# 🏗️ Architecture Overview

The application follows a modular full-stack architecture.

```text
                    ┌──────────────────┐
                    │     Frontend     │
                    │  React + TS      │
                    └────────┬─────────┘
                             │
                             │ HTTPS / REST API
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │ Node + Express   │
                    └───────┬─────┬────┘
                            │     │
                            │     │
                            ▼     ▼
                     ┌──────────┐ ┌──────────────┐
                     │ MongoDB  │ │  ML Service  │
                     │ Database │ │ Python/AI ML │
                     └──────────┘ └──────────────┘
```

### Application Flow

```text
Student
   │
   ▼
React Frontend
   │
   ▼
Node.js / Express API
   │
   ├──────────────► MongoDB
   │
   └──────────────► AI/ML Service
                         │
                         ▼
                  Demand Predictions
                         │
                         ▼
                    Admin Dashboard
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Mongoose

## Database

* MongoDB

## AI/ML

* Python
* Pandas
* NumPy
* Scikit-learn
* FastAPI / Flask

---

# 📁 Project Structure

```text
CAFETARIA/
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   └── package.json
│
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   │
│   └── package.json
│
├── ml-service/              # AI/ML service
│   ├── data/
│   ├── models/
│   ├── train.py
│   ├── predict.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Python 3.10+
* Git

---

# 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd CAFETARIA
```

---

# 2️⃣ Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend should start on a local development URL displayed in your terminal.

---

# 3️⃣ Backend Setup

Open another terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

Start the backend:

```bash
npm run dev
```

The backend should now be running on the configured port.

---

# 4️⃣ MongoDB Setup

You can use either:

* Local MongoDB
* MongoDB Atlas

Add your connection string to:

```text
backend/.env
```

Example:

```env
MONGODB_URI=your_mongodb_connection_string
```

> Never commit your `.env` file or real database credentials to GitHub.

---

# 5️⃣ AI/ML Service Setup

Navigate to the ML service:

```bash
cd ml-service
```

Create and activate a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the ML service:

```bash
python app.py
```

Or, if using FastAPI:

```bash
uvicorn app:app --reload --port 8000
```

The ML service should run on:

```text
http://localhost:8000
```

---

# 🔐 Environment Variables

The project uses environment variables for sensitive configuration.

Example backend `.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

## Important

Never commit:

```text
.env
```

Add it to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

Do not place real credentials, database passwords, JWT secrets, or API keys inside public files.

---

# 🔑 Authentication & Authorization

The application uses:

* Secure password hashing
* JWT authentication
* Role-Based Access Control

Supported roles:

```text
student
staff
admin
```

Protected routes are validated on the backend to ensure users can only access resources they are authorized to use.

---

# 📦 API Architecture

The backend follows a REST API structure.

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Food Items

```text
GET    /api/food-items
GET    /api/food-items/:id
POST   /api/food-items
PATCH  /api/food-items/:id
DELETE /api/food-items/:id
```

### Orders

```text
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
```

### AI Predictions

```text
GET    /api/predictions
POST   /api/predictions/generate
```

---

# 🤖 AI Food Demand Prediction

The AI module analyzes historical cafeteria order data to estimate future demand.

Example output:

```text
Predicted Demand for Tomorrow

Samosa       → 112
Burger       → 68
Masala Dosa  → 81
Tea          → 154
```

The prediction model can use factors such as:

* Historical order data
* Day of the week
* Food item
* Previous demand
* Time period
* Events or holidays

The predictions are displayed on the Admin Dashboard to support better food preparation and inventory planning.

---

# 🔄 Order Workflow

```text
Student Places Order
        │
        ▼
      PLACED
        │
        ▼
     ACCEPTED
        │
        ▼
    PREPARING
        │
        ▼
       READY
        │
        ▼
     COMPLETED
```

---

# 🧪 Development Status

This project is currently being developed as a **college technical assessment project**.

Current development priorities:

* [x] Project planning and architecture
* [x] Frontend implementation
* [x] Backend API
* [x] MongoDB integration
* [x] Authentication and authorization
* [x] Order management
* [x] Admin dashboard
* [x] Analytics
* [x] AI demand prediction
* [x] Testing and security review
* [ ] Deployment

---

# 🔮 Future Improvements

* Real-time order updates using Socket.IO
* QR-based order collection
* Online payment integration
* AI-powered food recommendations
* Advanced queue prediction
* Inventory management
* Food waste analytics
* Mobile application
* Notification system

---

# 👨‍💻 Development

Built as a full-stack college project focused on:

* Full-stack development
* Secure backend architecture
* Database design
* REST API development
* Role-based authentication
* Data analytics
* Applied Machine Learning

---

# 📄 License

This project is currently intended for educational and academic purposes.

---

⭐ If you found this project interesting, consider giving the repository a star!
