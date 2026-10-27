import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { TypeAnimation } from "react-type-animation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import SentimentMascot from "./components/SentimentMascot";
import ConfettiBurst from "./components/ConfettiBurst";

const API_BASE = import.meta.env.VITE_API_URL || "";

const CHART_COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function App() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");

  // Initialize tsparticles
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Web Audio API sound synthesizer
  const playSoundEffect = (sentiment) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (sentiment === "positive") {
        // Uplifting celebration arpeggio: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
        });
      } else if (sentiment === "negative") {
        // Dramatic angry / sad descending wobble
        const notes = [349.23, 293.66, 233.08, 196.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
        });
      } else {
        // Serene zen chime
        const notes = [440.0, 659.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      }
    } catch (e) {
      console.debug("Audio synthesis skipped:", e);
    }
  };

  // Fetch initial history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHistory(data.map(item => ({
              review: item.review || item.review_text,
              sentiment: (item.sentiment || "neutral").toLowerCase(),
              score: item.score,
              date: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
            })));
          }
        }
      } catch (err) {
        console.warn("Could not load reviews on startup:", err.message);
      }
    };
    fetchHistory();
  }, []);

  const analyze = async () => {
    if (!review.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: review.trim() })
      });

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();
      const normalizedSentiment = (data.sentiment || "neutral").toLowerCase();
      const parsedScore = parseFloat(data.score) || 0;

      const formattedResult = {
        review: data.review || review.trim(),
        sentiment: normalizedSentiment,
        score: parsedScore,
        source: data.source || "ml-model",
        saved: data.saved,
        date: "Just now"
      };

      setResult(formattedResult);
      setHistory(prev => [formattedResult, ...prev]);

      // Play audio feedback
      playSoundEffect(normalizedSentiment);

      // Trigger celebration confetti on positive sentiment
      if (normalizedSentiment === "positive") {
        setConfettiTrigger(prev => prev + 1);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze review");
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: "Positive", text: "Outstanding quality! Superb battery life, fast delivery and love this product.", sentiment: "positive" },
    { label: "Negative", text: "Terrible product, broke within two days. Absolute waste of money!", sentiment: "negative" },
    { label: "Neutral", text: "Standard build quality, works okay for the price point, nothing special.", sentiment: "neutral" }
  ];

  // Metrics computation
  const totalReviews = history.length;
  const positiveCount = history.filter(r => r.sentiment === "positive").length;
  const negativeCount = history.filter(r => r.sentiment === "negative").length;
  const neutralCount = history.filter(r => r.sentiment === "neutral").length;

  const happinessIndex = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const avgConfidence = totalReviews > 0
    ? Math.round(history.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0) / totalReviews)
    : 0;

  const chartData = [
    { name: "Positive", value: positiveCount },
    { name: "Negative", value: negativeCount },
    { name: "Neutral", value: neutralCount }
  ];

  // Filtered reviews
  const filteredHistory = useMemo(() => {
    if (!searchFilter.trim()) return history;
    const q = searchFilter.toLowerCase();
    return history.filter(item =>
      item.review.toLowerCase().includes(q) || item.sentiment.toLowerCase().includes(q)
    );
  }, [history, searchFilter]);

  // Ambient fluid dynamic background gradient
  const getAmbientGradients = () => {
    if (!result) {
      return {
        bg: "radial-gradient(circle at 50% 10%, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0) 65%), #090d16",
        aura: "rgba(59, 130, 246, 0.15)"
      };
    }
    if (result.sentiment === "positive") {
      return {
        bg: "radial-gradient(circle at 50% 15%, rgba(16, 185, 129, 0.35) 0%, rgba(6, 78, 59, 0) 65%), #061e14",
        aura: "rgba(16, 185, 129, 0.3)"
      };
    }
    if (result.sentiment === "negative") {
      return {
        bg: "radial-gradient(circle at 50% 15%, rgba(239, 68, 68, 0.35) 0%, rgba(127, 29, 29, 0) 65%), #1a0808",
        aura: "rgba(239, 68, 68, 0.3)"
      };
    }
    return {
      bg: "radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.35) 0%, rgba(120, 53, 15, 0) 65%), #1c1106",
      aura: "rgba(245, 158, 11, 0.3)"
    };
  };

  const ambient = getAmbientGradients();

  return (
    <motion.div
      style={{ ...styles.page, background: ambient.bg }}
      animate={{ background: ambient.bg }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
    >
      <ConfettiBurst trigger={confettiTrigger} />

      {/* Floating Ambient tsparticles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 30, density: { enable: true, value_area: 800 } },
            color: { value: ["#ffffff", "#38bdf8", "#34d399", "#f59e0b"] },
            opacity: { value: 0.18 },
            size: { value: 2.5 },
            move: { enable: true, speed: 0.7, direction: "none", out_mode: "out" },
            links: {
              enable: true,
              distance: 130,
              color: "#ffffff",
              opacity: 0.08,
              width: 1
            }
          }
        }}
        style={styles.particlesCanvas}
      />

      {/* Glowing Ambient Background Spotlights */}
      <motion.div
        style={{ ...styles.ambientGlowSpot, background: ambient.aura }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerBrand}>
            <div style={styles.headerIcon}>⚡</div>
            <div>
              <h1 style={styles.headerTitle} className="shimmer-text">
                RSR Sentiment Dashboard
              </h1>
              <span style={styles.headerSubtitle}>Real-time Emotion Intelligence</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.main}>

        {/* Two-Column Interactive Grid */}
        <div style={styles.contentGrid}>

          {/* LEFT: Sentiment Analyzer Hero Card */}
          <motion.div
            className={`glass-panel ${
              result?.sentiment === "positive" ? "glow-positive" :
              result?.sentiment === "negative" ? "glow-negative" :
              result?.sentiment === "neutral" ? "glow-neutral" : ""
            }`}
            style={styles.card}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Expressive Mascot Display */}
            <SentimentMascot sentiment={result?.sentiment} score={result?.score} />

            {/* Typewriter Banner */}
            <div style={styles.typewriterWrapper}>
              <TypeAnimation
                sequence={[
                  "AI Sentiment Analyzer 🚀",
                  2400,
                  "Dancing & Expressive Emotions 🎭",
                  2400,
                  "Multi-Class Confidence Scoring 🎯",
                  2400
                ]}
                wrapper="h2"
                style={styles.animatedTitle}
                repeat={Infinity}
              />
            </div>

            <p style={styles.cardDesc}>
              Analyze customer reviews instantly with calibrated scikit-learn models & live emotional reactions.
            </p>

            {/* Brand Quick Links */}
            <div style={styles.brandContainer}>
              <span style={styles.brandLabel}>Marketplaces:</span>
              <div style={styles.brandRow}>
                <div style={styles.brandLogoWrapper} onClick={() => window.open("https://www.amazon.in", "_blank")}>
                  <img src="/logos/1.jpg" alt="Amazon" style={styles.brandImg} />
                </div>
                <div style={styles.brandLogoWrapper} onClick={() => window.open("https://www.flipkart.com", "_blank")}>
                  <img src="/logos/2.png" alt="Flipkart" style={styles.brandImg} />
                </div>
                <div style={styles.brandLogoWrapper} onClick={() => window.open("https://www.myntra.com", "_blank")}>
                  <img src="/logos/3.png" alt="Myntra" style={styles.brandImg} />
                </div>
                <div style={styles.brandLogoWrapper} onClick={() => window.open("https://www.ajio.com", "_blank")}>
                  <img src="/logos/4.jpg" alt="Ajio" style={styles.brandImg} />
                </div>
              </div>
            </div>

            {/* Quick Sample Buttons */}
            <div style={styles.sampleContainer}>
              <span style={styles.sampleLabel}>Try demo reviews:</span>
              <div style={styles.samplePills}>
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={{
                      ...styles.sampleBtn,
                      border: s.sentiment === "positive" ? "1px solid rgba(16, 185, 129, 0.4)" :
                              s.sentiment === "negative" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)"
                    }}
                    onClick={() => setReview(s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Input Textarea */}
            <div style={styles.textareaWrapper}>
              <textarea
                style={styles.textarea}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Paste or write a customer product review here..."
                rows={4}
              />
              <span style={styles.charCounter}>{review.length} characters</span>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorAlert}
              >
                ⚠️ {errorMsg}
              </motion.div>
            )}

            {/* Analyze Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...styles.submitBtn,
                opacity: loading || !review.trim() ? 0.6 : 1,
                cursor: loading || !review.trim() ? "not-allowed" : "pointer"
              }}
              onClick={analyze}
              disabled={loading || !review.trim()}
            >
              {loading ? (
                <span style={styles.loadingSpinner}>⚙️ Analyzing Emotion...</span>
              ) : (
                <span>⚡ Analyze Sentiment</span>
              )}
            </motion.button>

            {/* Sentiment Result Details Card */}
            <AnimatePresence>
              {result && (
                <motion.div
                  key="result-details"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={styles.resultDetails}
                >
                  <div style={styles.resultHeader}>
                    <div style={styles.badgeGroup}>
                      <span className={`badge-pill badge-${result.sentiment}`}>
                        {result.sentiment === "positive" && "😊 POSITIVE"}
                        {result.sentiment === "negative" && "😡 NEGATIVE"}
                        {result.sentiment === "neutral" && "😐 NEUTRAL"}
                      </span>
                      <span style={styles.confidenceScore}>
                        {result.score}% Confidence
                      </span>
                    </div>

                    <span style={styles.timestampBadge}>{result.date}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={styles.progressBarTrack}>
                    <motion.div
                      style={{
                        ...styles.progressBarFill,
                        backgroundColor:
                          result.sentiment === "positive" ? "#10b981" :
                          result.sentiment === "negative" ? "#ef4444" : "#f59e0b"
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, result.score))}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <div style={styles.resultFooter}>
                    <span>Engine: <strong>{result.source === "ml-model" ? "Calibrated LinearSVC" : "In-process Fallback"}</strong></span>
                    <span>{result.saved ? "✓ Persisted in DB" : "• Live session"}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: Analytics & Review History Card */}
          <motion.div
            className="glass-panel"
            style={styles.card}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div style={styles.analyticsHeader}>
              <h2 style={styles.cardTitle}>Emotion Breakdown</h2>
              <span style={styles.totalBadge}>{totalReviews} reviews logged</span>
            </div>
            <p style={styles.cardDesc}>Visual distribution of analyzed customer sentiments.</p>

            {/* Interactive Recharts Donut */}
            {totalReviews > 0 ? (
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={4}
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Legend
                      formatter={(val) => <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={styles.emptyChart}>
                <span style={styles.emptyIcon}>📊</span>
                <p style={styles.emptyText}>No reviews recorded yet</p>
                <span style={styles.emptySub}>Analyze your first review to reveal insights!</span>
              </div>
            )}

            {/* Review History Section */}
            <div style={styles.historySection}>
              <div style={styles.historyTopRow}>
                <h3 style={styles.historyTitle}>Live Review Stream</h3>
                <input
                  type="text"
                  placeholder="Filter reviews..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={styles.filterInput}
                />
              </div>

              {filteredHistory.length > 0 ? (
                <div style={styles.tableScrollWrapper}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Review</th>
                        <th style={{ width: "95px" }}>Emotion</th>
                        <th style={{ width: "70px" }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.slice(0, 25).map((item, idx) => (
                        <tr key={idx}>
                          <td style={styles.tdReview} title={item.review}>
                            {item.review}
                          </td>
                          <td>
                            <span className={`badge-pill badge-${item.sentiment}`} style={{ fontSize: "0.68rem", padding: "2px 8px" }}>
                              {item.sentiment}
                            </span>
                          </td>
                          <td style={styles.tdScore}>
                            {item.score}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.emptyTable}>
                  {searchFilter ? "No reviews match your filter." : "Recent reviews will appear here in real-time."}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </motion.div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    color: "#f8fafc",
    transition: "background 0.8s ease"
  },
  particlesCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1
  },
  ambientGlowSpot: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "350px",
    borderRadius: "50%",
    filter: "blur(110px)",
    pointerEvents: "none",
    zIndex: 1
  },
  header: {
    width: "100%",
    background: "rgba(9, 13, 22, 0.75)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    position: "sticky",
    top: 0,
    zIndex: 50
  },
  headerInner: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  headerIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
  },
  headerTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: 1.1
  },
  headerSubtitle: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    fontWeight: "500",
    letterSpacing: "0.03em"
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "9999px"
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981"
  },
  statusText: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#34d399",
    letterSpacing: "0.02em"
  },
  main: {
    maxWidth: "1250px",
    width: "100%",
    margin: "24px auto",
    padding: "0 20px 40px 20px",
    position: "relative",
    zIndex: 10,
    flex: 1
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  ratioBar: {
    width: "100%",
    height: "10px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "5px",
    overflow: "hidden",
    display: "flex",
    marginTop: "8px"
  },
  ratioSegment: {
    height: "100%",
    transition: "width 0.5s ease"
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "28px",
    alignItems: "start"
  },
  card: {
    padding: "28px",
    position: "relative",
    overflow: "hidden"
  },
  typewriterWrapper: {
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop: "4px"
  },
  animatedTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.01em"
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#ffffff"
  },
  cardDesc: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "4px",
    marginBottom: "18px"
  },
  brandContainer: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "14px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px"
  },
  brandLabel: {
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "600"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  brandLogoWrapper: {
    background: "#ffffff",
    padding: "4px 8px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },
  brandImg: {
    height: "22px",
    width: "auto",
    maxWidth: "50px",
    objectFit: "contain"
  },
  sampleContainer: {
    marginBottom: "14px"
  },
  sampleLabel: {
    fontSize: "0.76rem",
    color: "#94a3b8",
    fontWeight: "600",
    display: "block",
    marginBottom: "8px"
  },
  samplePills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  sampleBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "#f1f5f9",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.15s ease"
  },
  textareaWrapper: {
    position: "relative",
    marginBottom: "14px"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    background: "rgba(10, 15, 26, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    fontSize: "0.92rem",
    lineHeight: "1.5",
    color: "#f8fafc",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)"
  },
  charCounter: {
    position: "absolute",
    right: "12px",
    bottom: "10px",
    fontSize: "0.7rem",
    color: "#64748b"
  },
  errorAlert: {
    padding: "10px 14px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#fca5a5",
    borderRadius: "10px",
    fontSize: "0.82rem",
    marginBottom: "12px"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    fontSize: "0.98rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  loadingSpinner: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  resultDetails: {
    marginTop: "20px",
    padding: "18px",
    background: "rgba(10, 15, 26, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px"
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  badgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  confidenceScore: {
    fontSize: "0.84rem",
    fontWeight: "700",
    color: "#cbd5e1"
  },
  timestampBadge: {
    fontSize: "0.72rem",
    color: "#64748b"
  },
  progressBarTrack: {
    width: "100%",
    height: "7px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "10px"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "4px"
  },
  resultFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.74rem",
    color: "#64748b"
  },
  analyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  totalBadge: {
    fontSize: "0.75rem",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontWeight: "600"
  },
  chartContainer: {
    width: "100%",
    height: "230px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyChart: {
    height: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    margin: "12px 0"
  },
  emptyIcon: {
    fontSize: "32px",
    marginBottom: "6px"
  },
  emptyText: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    fontWeight: "600"
  },
  emptySub: {
    fontSize: "0.76rem",
    color: "#64748b",
    marginTop: "2px"
  },
  historySection: {
    marginTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: "18px"
  },
  historyTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "10px"
  },
  historyTitle: {
    fontSize: "0.98rem",
    fontWeight: "700",
    color: "#f1f5f9"
  },
  filterInput: {
    padding: "6px 12px",
    fontSize: "0.76rem",
    background: "rgba(10, 15, 26, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    outline: "none"
  },
  tableScrollWrapper: {
    maxHeight: "260px",
    overflowY: "auto",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.06)"
  },
  tdReview: {
    maxWidth: "200px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  tdScore: {
    fontWeight: "700",
    color: "#94a3b8"
  },
  emptyTable: {
    padding: "24px",
    textAlign: "center",
    fontSize: "0.82rem",
    color: "#64748b"
  }
};