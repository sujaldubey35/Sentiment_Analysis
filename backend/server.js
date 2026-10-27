const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');
const Sentiment = require('sentiment');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const jsSentiment = new Sentiment();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "sentiment_db",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Machine Learning microservice URL (defaults to localhost for local dev; docker-compose sets http://ml-model:8001)
const ML_API = process.env.ML_API || "http://127.0.0.1:8001";

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);
let isDbConnected = false;

// Auto-initialize MySQL schema on server startup
async function initDatabase() {
  try {
    // Attempt connecting to MySQL server to ensure DB exists
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConn.end();

    // Ensure reviews table exists with proper schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_text TEXT NOT NULL,
        sentiment VARCHAR(20) NOT NULL,
        score FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isDbConnected = true;
    console.log("MySQL database and 'reviews' table initialized successfully.");
  } catch (err) {
    isDbConnected = false;
    console.warn("MySQL connection warning:", err.message);
    console.warn("Backend will continue running. Reviews will not be persisted until MySQL is available.");
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isDbConnected ? "connected" : "disconnected",
    ml_api: ML_API
  });
});

// Sentiment analysis endpoint
app.post("/api/analyze", async (req, res) => {
  const { review } = req.body;

  if (!review || !review.trim()) {
    return res.status(400).json({ error: "review text is required" });
  }

  let sentiment_label = "neutral";
  let score = 50.0;
  let source = "ml-model";

  try {
    // Attempt prediction via Python ML microservice
    const mlResponse = await axios.post(`${ML_API}/predict`, {
      text: review.trim()
    }, { timeout: 3500 });

    sentiment_label = String(mlResponse.data.sentiment).toLowerCase();
    score = parseFloat(mlResponse.data.score) || 0.0;
  } catch (mlErr) {
    console.warn(`ML API unavailable at ${ML_API} (${mlErr.message}). Using JavaScript fallback.`);
    source = "js-fallback";

    // Fallback using the NPM sentiment library
    const result = jsSentiment.analyze(review);
    if (result.score > 0) {
      sentiment_label = "positive";
    } else if (result.score < 0) {
      sentiment_label = "negative";
    } else {
      sentiment_label = "neutral";
    }
    score = Math.min(100, Math.max(50, 50 + Math.abs(result.score) * 15));
  }

  // Persist to MySQL if available
  let saved = false;
  try {
    const query = `
      INSERT INTO reviews (review_text, sentiment, score, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    await pool.execute(query, [review.trim(), sentiment_label, score]);
    saved = true;
    isDbConnected = true;
  } catch (dbErr) {
    console.warn("Failed to persist review to MySQL:", dbErr.message);
    saved = false;
  }

  res.json({
    review: review.trim(),
    sentiment: sentiment_label,
    score: score,
    source: source,
    saved: saved
  });
});

// Get recent reviews endpoint
app.get("/api/reviews", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, review_text AS review, sentiment, score, created_at
      FROM reviews
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    console.warn("Could not fetch reviews from MySQL:", err.message);
    res.json([]);
  }
});

// Sentiment statistics endpoint for charts
app.get("/api/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sentiment, COUNT(*) AS count
      FROM reviews
      GROUP BY sentiment
    `);
    res.json(rows);
  } catch (err) {
    console.warn("Could not fetch stats from MySQL:", err.message);
    res.json([]);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  await initDatabase();
});