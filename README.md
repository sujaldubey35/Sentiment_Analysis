# Product Review Sentiment Analysis - Project Skeleton

## Overview
This is a starter project skeleton for the **Product Review Sentiment Analysis Web App** using React (frontend), Node.js + Express (backend), and MySQL as the database. Sentiment analysis is performed using the `sentiment` NPM package (JavaScript).

## Defaults
- Database name: `sentiment_db`
- Table name: `reviews`
- Backend port: `5000`
- Frontend dev server: `3000` (Vite) / production served on nginx:80
- MySQL root password: `rootpassword` (change in production)

## Run locally (without Docker)
1. Start MySQL server and create DB using `backend/init_db.sql`.
2. Backend:
   - `cd backend`
   - `npm install`
   - `npm run start`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run start` (visit http://localhost:3000)

## Run with Docker (recommended for quick demo)
1. Make sure you have Docker and docker-compose installed.
2. From the project root run:

   ```bash
   docker compose up --build
   ```

3. Open frontend at `http://localhost:3000` (it serves the built site). Backend on `http://localhost:5000`.

## API
- `POST /api/analyze` JSON body: { "review": "text here" }
  - returns { "sentiment": "Positive|Negative|Neutral", "score": <int>, "details": {...} }

## Notes & Next steps
- This uses the simple `sentiment` JS package. For better accuracy, consider training a Python model (scikit-learn / BERT) and exposing it as a microservice.
- Update env vars in `backend/.env` and `frontend/.env` as needed.
- Add authentication, pagination, and admin dashboard as enhancements.
