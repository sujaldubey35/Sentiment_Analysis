# Product Review Sentiment Analysis Web App

A production-grade, full-stack microservices application for real-time customer sentiment analysis.

## Architecture

- **Frontend**: React 18, Vite, Framer Motion, Recharts, `react-tsparticles`, Web Audio API. Served on `http://localhost:3000` (development) or Nginx on port 80 (Docker).
- **Backend API**: Node.js, Express, `mysql2` connection pooling, and fallback sentiment scoring. Served on `http://localhost:5000`.
- **ML Service**: Python 3.10+, FastAPI, Scikit-Learn (TF-IDF + Calibrated LinearSVC). Served on `http://localhost:8001`.
- **Database**: MySQL 8.0 storing reviews, predicted sentiment, confidence scores, and timestamps.

---

## Quick Start with Docker (Recommended)

Make sure Docker and Docker Compose are installed and running.

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **ML Model API**: [http://localhost:8001](http://localhost:8001)
- **Swagger Docs for ML API**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## Local Development (Without Docker)

### 1. ML Microservice (Python)
```bash
cd ml-model
pip install -r requirements.txt
python train_model.py       # Trains model and creates model.pkl & vectorizer.pkl
uvicorn app:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Backend API (Node.js)
```bash
cd backend
npm install
npm run start               # Starts server on http://localhost:5000
```
> *Note: If MySQL is not running locally, the backend gracefully operates in resilient mode and uses memory/mock fallback without crashing.*

### 3. Frontend App (React + Vite)
```bash
cd frontend
npm install
npm run start               # Opens dev server on http://localhost:3000
```

---

## API Endpoints

### Backend (`http://localhost:5000`)
- `GET /api/health` - Server health status and database connectivity check.
- `POST /api/analyze` - Analyzes review text.
  - **Body**: `{ "review": "Great quality phone!" }`
  - **Response**: `{ "review": "...", "sentiment": "positive", "score": 85.5, "source": "ml-model", "saved": true }`
- `GET /api/reviews` - Returns recent 50 analyzed reviews with timestamps.
- `GET /api/stats` - Returns counts aggregated by sentiment (`positive`, `negative`, `neutral`).

### ML Model API (`http://localhost:8001`)
- `GET /` - Root status and model load verification.
- `GET /health` - Health check endpoint.
- `POST /predict` - Accepts `{ "text": "review string" }` and returns `{ "review": "...", "sentiment": "positive", "score": 85.5 }`.
