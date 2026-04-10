CREATE DATABASE IF NOT EXISTS sentiment_db;
USE sentiment_db;
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_text TEXT,
  sentiment VARCHAR(20),
  score INT,
  created_at DATETIME
);
