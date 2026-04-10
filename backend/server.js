const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const Sentiment = require('sentiment');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sentiment = new Sentiment();

// Hindi + Hinglish words dictionary
const hindiWords = {
  accha: 3,
  achha: 3,
  badhiya: 4,
  mast: 4,
  bekar: -3,
  bura: -3,
  kharab: -4,
  "bahut accha": 5,
  "bahut bura": -5
};

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "sentiment_db",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// sentiment analyze
app.post("/api/analyze", async (req, res) => {
  try {

    const { review } = req.body;

    if (!review) {
      return res.status(400).json({ error: "review required" });
    }

    // analyze sentiment
    const result = sentiment.analyze(review, { extras: hindiWords });

    let sentiment_label = "Neutral";

    if (result.score > 0) sentiment_label = "Positive";
    else if (result.score < 0) sentiment_label = "Negative";

    // save to database
    const conn = await getConnection();

    const query =
      "INSERT INTO reviews (review_text, sentiment, score, created_at) VALUES (?, ?, ?, NOW())";

    await conn.execute(query, [review, sentiment_label, result.score]);

    await conn.end();

    res.json({
      sentiment: sentiment_label,
      score: result.score
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal error",
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});