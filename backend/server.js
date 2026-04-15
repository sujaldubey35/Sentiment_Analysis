const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "sentiment_db",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
};

// ML API URL
const ML_API = process.env.ML_API || "http://ml-model:8001";

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


// sentiment analyze using ML model
app.post("/api/analyze", async (req, res) => {

  try {

    const { review } = req.body;

    if (!review) {
      return res.status(400).json({ error: "review required" });
    }

    // call ML model API
    const mlResponse = await axios.post(`${ML_API}/predict`, {
      text: review
    });

    const sentiment_label = mlResponse.data.sentiment;
    const score = mlResponse.data.score;

    // save to database
    const conn = await getConnection();

    const query = `
      INSERT INTO reviews (review_text, sentiment, score, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    await conn.execute(query, [review, sentiment_label, score]);

    await conn.end();

    res.json({
      review: review,
      sentiment: sentiment_label,
      score: score
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "internal error",
      message: err.message
    });

  }

});


// sentiment statistics for chart
app.get("/api/stats", async (req, res) => {

  try {

    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT sentiment, COUNT(*) AS count
      FROM reviews
      GROUP BY sentiment
    `);

    await conn.end();

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "failed to fetch stats"
    });

  }

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});