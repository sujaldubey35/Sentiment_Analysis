import React, { useState } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { TypeAnimation } from "react-type-animation";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

export default function App() {

  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const analyze = async () => {

    setLoading(true);

    try {

      const res = await fetch(import.meta.env.VITE_API_URL + "/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review })
      });

      if (!res.ok) {
        throw new Error("Server error: " + res.status);
      }

      const data = await res.json();

      setResult(data);

      setHistory(prev => [...prev, { review, ...data }]);

      const positiveSound = new Audio("/positive.mp3");
      const negativeSound = new Audio("/negative.mp3");

      if (data.sentiment === "Positive") positiveSound.play();
      if (data.sentiment === "Negative") negativeSound.play();

    } catch (err) {

      alert("API Error: " + err.message);

    }

    setLoading(false);
  };

  const getEmoji = () => {
    if (!result) return "🤖";
    if (result.sentiment === "Positive") return "💃";
    if (result.sentiment === "Negative") return "😡";
    return "😐";
  };

  const chartData = [
    {
      name: "Positive",
      value: history.filter(r => r.sentiment === "Positive").length
    },
    {
      name: "Negative",
      value: history.filter(r => r.sentiment === "Negative").length
    },
    {
      name: "Neutral",
      value: history.filter(r => r.sentiment === "Neutral").length
    }
  ];

  const getBackground = () => {

    if (!result) return "linear-gradient(135deg,#141E30,#243B55)";
    if (result.sentiment === "Positive") return "linear-gradient(135deg,#11998e,#38ef7d)";
    if (result.sentiment === "Negative") return "linear-gradient(135deg,#ff416c,#ff4b2b)";
    return "linear-gradient(135deg,#f7971e,#ffd200)";
  };

  return (

    <motion.div
      style={styles.page}
      animate={{ background: getBackground() }}
      transition={{ duration: 0.8 }}
    >

      <Particles
        options={{
          particles: {
            number: { value: 40 },
            size: { value: 3 },
            move: { speed: 1 },
            links: { enable: true }
          }
        }}
      />

      <motion.div
        style={styles.header}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
      >
        <h2>RSR Sentiment Dashboard</h2>
      </motion.div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >

        <TypeAnimation
          sequence={[
            "AI Sentiment Analyzer 🤖",
            2000,
            "Analyzing Customer Reviews...",
            2000
          ]}
          wrapper="h1"
          repeat={Infinity}
        />

        {/* BRAND LOGOS */}

        <div style={styles.brandRow}>

          <img
            src="/logos/1.jpg"
            alt="Amazon"
            style={styles.logo}
            onClick={() => window.open("https://www.amazon.in", "_blank")}
          />

          <img
            src="/logos/2.png"
            alt="Flipkart"
            style={styles.logo}
            onClick={() => window.open("https://www.flipkart.com", "_blank")}
          />

          <img
            src="/logos/3.png"
            alt="Myntra"
            style={styles.logo}
            onClick={() => window.open("https://www.myntra.com", "_blank")}
          />

          <img
            src="/logos/4.jpg"
            alt="Ajio"
            style={styles.logo}
            onClick={() => window.open("https://www.ajio.com", "_blank")}
          />

        </div>

        <textarea
          style={styles.textarea}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Type your review here..."
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          style={styles.button}
          onClick={analyze}
          disabled={loading || !review.trim()}
        >
          {loading ? "🤖 Analyzing..." : "Analyze"}
        </motion.button>

        {result && (

          <motion.div style={styles.resultCard}>

            <motion.h2
              style={styles.emoji}
              animate={
                result.sentiment === "Positive"
                  ? { rotate: [0, 15, -15, 15, 0], scale: [1, 1.5, 1] }
                  : result.sentiment === "Negative"
                  ? { x: [-12, 12, -12, 12, 0] }
                  : { scale: [1, 1.1, 1] }
              }
            >
              {getEmoji()}
            </motion.h2>

            <p><strong>Sentiment:</strong> {result.sentiment}</p>
            <p><strong>Score:</strong> {result.score}</p>

          </motion.div>

        )}

        {history.length > 0 && (

          <>

            <h3>Sentiment Analytics</h3>

            <PieChart width={300} height={300}>
              <Pie data={chartData} dataKey="value" outerRadius={100} label>
                <Cell fill="#2ecc71"/>
                <Cell fill="#e74c3c"/>
                <Cell fill="#f39c12"/>
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>

            <h3>Review History</h3>

            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Review</th>
                  <th>Sentiment</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item,i)=>(
                  <tr key={i}>
                    <td>{item.review}</td>
                    <td>{item.sentiment}</td>
                    <td>{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </>

        )}

      </motion.div>

    </motion.div>
  );
}

const styles = {

  page:{
    minHeight:"100vh",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    fontFamily:"Segoe UI"
  },

  header:{
    width:"100%",
    padding:"18px",
    background:"#000",
    color:"#fff",
    textAlign:"center"
  },

  card:{
    marginTop:"40px",
    background:"#fff",
    padding:"40px",
    borderRadius:"18px",
    width:"420px",
    boxShadow:"0 20px 50px rgba(0,0,0,0.3)",
    textAlign:"center"
  },

  brandRow:{
    display:"flex",
    justifyContent:"space-around",
    marginBottom:"20px"
  },

  logo:{
    width:"60px",
    cursor:"pointer"
  },

  textarea:{
    width:"100%",
    height:"120px",
    padding:"12px",
    borderRadius:"10px",
    border:"1px solid #ddd",
    marginBottom:"20px"
  },

  button:{
    width:"100%",
    padding:"12px",
    background:"#243B55",
    color:"#fff",
    border:"none",
    borderRadius:"10px",
    cursor:"pointer"
  },

  resultCard:{
    marginTop:"25px",
    padding:"20px",
    borderRadius:"12px",
    background:"#f5f7fa"
  },

  emoji:{
    fontSize:"55px"
  }

};