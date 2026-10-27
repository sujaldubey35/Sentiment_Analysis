import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SentimentMascot({ sentiment, score }) {
  // Normalize sentiment: 'positive', 'negative', 'neutral', or 'idle'
  const state = sentiment ? sentiment.toLowerCase() : "idle";

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {state === "positive" && <PositiveMascot key="positive" score={score} />}
        {state === "negative" && <NegativeMascot key="negative" score={score} />}
        {state === "neutral" && <NeutralMascot key="neutral" score={score} />}
        {state === "idle" && <IdleMascot key="idle" />}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 1. POSITIVE MASCOT: Dancing & Celebrating
// ==========================================
function PositiveMascot({ score }) {
  return (
    <motion.div
      style={styles.mascotWrapper}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Floating musical notes and sparkles */}
      <motion.div
        style={{ ...styles.floatingIcon, top: "-15px", left: "15px" }}
        animate={{ y: [-5, -25, -5], x: [-5, -15, -5], opacity: [0, 1, 0], rotate: [-10, 20, -10] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
      <motion.div
        style={{ ...styles.floatingIcon, top: "-20px", right: "20px" }}
        animate={{ y: [-5, -28, -5], x: [5, 18, 5], opacity: [0, 1, 0], rotate: [10, -20, 10] }}
        transition={{ repeat: Infinity, duration: 2.1, delay: 0.3, ease: "easeInOut" }}
      >
        🎵
      </motion.div>
      <motion.div
        style={{ ...styles.floatingIcon, bottom: "40px", right: "-10px" }}
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        ⭐
      </motion.div>

      {/* Rhythmic Dancing Body */}
      <motion.div
        animate={{
          y: [0, -20, 4, -16, 0],
          rotate: [0, -8, 8, -6, 0],
          scaleY: [1, 1.12, 0.88, 1.08, 1],
          scaleX: [1, 0.92, 1.1, 0.95, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 0.95,
          ease: "easeInOut"
        }}
        style={styles.characterContainer}
      >
        {/* Left Arm Waving */}
        <motion.div
          style={{ ...styles.arm, left: "-18px", top: "50px", transformOrigin: "top right" }}
          animate={{ rotate: [-35, -95, -25, -90, -35] }}
          transition={{ repeat: Infinity, duration: 0.95, ease: "easeInOut" }}
        >
          <div style={{ ...styles.hand, background: "#10b981" }}>🙌</div>
        </motion.div>

        {/* Right Arm Waving */}
        <motion.div
          style={{ ...styles.arm, right: "-18px", top: "50px", transformOrigin: "top left" }}
          animate={{ rotate: [35, 95, 25, 90, 35] }}
          transition={{ repeat: Infinity, duration: 0.95, ease: "easeInOut" }}
        >
          <div style={{ ...styles.hand, background: "#10b981" }}>🙌</div>
        </motion.div>

        {/* Mascot Robot Head & Body */}
        <div style={{ ...styles.robotHead, background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 25px rgba(16, 185, 129, 0.6)" }}>
          {/* Antenna */}
          <div style={styles.antennaStem}>
            <motion.div
              style={{ ...styles.antennaBall, background: "#34d399" }}
              animate={{ scale: [1, 1.4, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
          </div>

          {/* Face Screen */}
          <div style={styles.visorScreen}>
            {/* Happy Beaming Eyes */}
            <div style={styles.happyEyesRow}>
              <motion.div
                style={styles.crescentEye}
                animate={{ scaleY: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.95 }}
              />
              <motion.div
                style={styles.crescentEye}
                animate={{ scaleY: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.95 }}
              />
            </div>

            {/* Rosy Cheeks */}
            <div style={styles.cheeksRow}>
              <div style={{ ...styles.blush, background: "#f43f5e" }} />
              <div style={{ ...styles.blush, background: "#f43f5e" }} />
            </div>

            {/* Big Smile */}
            <div style={styles.bigSmile} />
          </div>
        </div>

        {/* Little Dancing Feet */}
        <div style={styles.feetRow}>
          <motion.div
            style={{ ...styles.foot, background: "#047857" }}
            animate={{ y: [0, -8, 0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 0.95 }}
          />
          <motion.div
            style={{ ...styles.foot, background: "#047857" }}
            animate={{ y: [0, 0, 0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 0.95 }}
          />
        </div>
      </motion.div>

      <motion.div
        style={styles.caption}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <span style={{ ...styles.tag, background: "#dcfce7", color: "#15803d" }}>
          🎉 Dancing with Joy! ({score}%)
        </span>
      </motion.div>
    </motion.div>
  );
}

// ==========================================
// 2. NEUTRAL MASCOT: Swaying & Thinking
// ==========================================
function NeutralMascot({ score }) {
  return (
    <motion.div
      style={styles.mascotWrapper}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Floating thought bubble */}
      <motion.div
        style={{ ...styles.floatingIcon, top: "-22px", right: "20px" }}
        animate={{ y: [-2, -10, -2], opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      >
        💭
      </motion.div>
      <motion.div
        style={{ ...styles.floatingIcon, top: "-10px", left: "15px" }}
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ repeat: Infinity, duration: 2.0, delay: 0.5 }}
      >
        〰️
      </motion.div>

      {/* Gentle Floating & Pendulum Swaying */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          rotate: [-5, 5, -5]
        }}
        transition={{
          repeat: Infinity,
          duration: 3.2,
          ease: "easeInOut"
        }}
        style={styles.characterContainer}
      >
        {/* Robot Head */}
        <div style={{ ...styles.robotHead, background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 25px rgba(245, 158, 11, 0.5)" }}>
          {/* Antenna */}
          <div style={styles.antennaStem}>
            <motion.div
              style={{ ...styles.antennaBall, background: "#fbbf24" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </div>

          {/* Face Screen */}
          <div style={styles.visorScreen}>
            {/* Thinking / Shifting Eyes */}
            <motion.div
              style={styles.eyesRow}
              animate={{ x: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            >
              {/* Left Eye */}
              <motion.div
                style={styles.neutralPupil}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.45, 0.5, 0.55, 1] }}
              />
              {/* Right Eye */}
              <motion.div
                style={styles.neutralPupil}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.45, 0.5, 0.55, 1] }}
              />
            </motion.div>

            {/* Straight Neutral Line Mouth */}
            <motion.div
              style={styles.neutralMouth}
              animate={{ width: ["36px", "26px", "36px"] }}
              transition={{ repeat: Infinity, duration: 3.2 }}
            />
          </div>
        </div>

        {/* Relaxed Hanging Feet */}
        <div style={styles.feetRow}>
          <div style={{ ...styles.foot, background: "#b45309" }} />
          <div style={{ ...styles.foot, background: "#b45309" }} />
        </div>
      </motion.div>

      <div style={styles.caption}>
        <span style={{ ...styles.tag, background: "#fef3c7", color: "#b45309" }}>
          🧘 Balanced & Contemplating ({score}%)
        </span>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. NEGATIVE MASCOT: Trembling, Angry & Sad
// ==========================================
function NegativeMascot({ score }) {
  return (
    <motion.div
      style={styles.mascotWrapper}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Steam puffs from ears */}
      <motion.div
        style={{ ...styles.floatingIcon, top: "-8px", left: "-15px" }}
        animate={{ x: [-2, -18], y: [-2, -14], opacity: [1, 0], scale: [0.8, 1.4] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeOut" }}
      >
        💨
      </motion.div>
      <motion.div
        style={{ ...styles.floatingIcon, top: "-8px", right: "-15px" }}
        animate={{ x: [2, 18], y: [-2, -14], opacity: [1, 0], scale: [0.8, 1.4] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        💨
      </motion.div>

      {/* Falling Tears */}
      <motion.div
        style={{ ...styles.fallingTear, left: "42px", top: "75px" }}
        animate={{ y: [0, 35], opacity: [1, 0], scaleY: [1, 1.4] }}
        transition={{ repeat: Infinity, duration: 0.7, ease: "easeIn" }}
      />
      <motion.div
        style={{ ...styles.fallingTear, right: "42px", top: "75px" }}
        animate={{ y: [0, 35], opacity: [1, 0], scaleY: [1, 1.4] }}
        transition={{ repeat: Infinity, duration: 0.7, delay: 0.35, ease: "easeIn" }}
      />

      {/* Trembling, Shaking Body */}
      <motion.div
        animate={{
          x: [-4, 4, -3, 3, -5, 5, 0],
          y: [-2, 2, -1, 1, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 0.22,
          ease: "linear"
        }}
        style={styles.characterContainer}
      >
        {/* Robot Head */}
        <motion.div
          style={{ ...styles.robotHead, background: "linear-gradient(135deg, #ef4444, #b91c1c)", boxShadow: "0 0 30px rgba(239, 68, 68, 0.75)" }}
          animate={{ filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
        >
          {/* Overheating Antenna */}
          <div style={styles.antennaStem}>
            <motion.div
              style={{ ...styles.antennaBall, background: "#f87171" }}
              animate={{ scale: [1, 1.5, 1], filter: ["hue-rotate(0deg)", "hue-rotate(30deg)", "hue-rotate(0deg)"] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            />
          </div>

          {/* Face Screen */}
          <div style={styles.visorScreen}>
            {/* Angry Eyebrows + Frustrated Eyes */}
            <div style={styles.angryEyesRow}>
              {/* Left Eyebrow & Eye */}
              <div style={styles.eyeWithBrow}>
                <div style={{ ...styles.brow, transform: "rotate(20deg)" }} />
                <div style={styles.angryPupil}>💢</div>
              </div>
              {/* Right Eyebrow & Eye */}
              <div style={styles.eyeWithBrow}>
                <div style={{ ...styles.brow, transform: "rotate(-20deg)" }} />
                <div style={styles.angryPupil}>💢</div>
              </div>
            </div>

            {/* Wavy Frown / Trembling Sad Mouth */}
            <motion.div
              style={styles.frownMouth}
              animate={{ scaleX: [1, 1.15, 1], y: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Shivering Feet */}
        <div style={styles.feetRow}>
          <div style={{ ...styles.foot, background: "#991b1b" }} />
          <div style={{ ...styles.foot, background: "#991b1b" }} />
        </div>
      </motion.div>

      <div style={styles.caption}>
        <span style={{ ...styles.tag, background: "#fee2e2", color: "#b91c1c" }}>
          😡 Trembling with Frustration ({score}%)
        </span>
      </div>
    </motion.div>
  );
}

// ==========================================
// 4. IDLE MASCOT: Calm, Breathing Bot
// ==========================================
function IdleMascot() {
  return (
    <motion.div
      style={styles.mascotWrapper}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        style={styles.characterContainer}
      >
        <div style={{ ...styles.robotHead, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}>
          <div style={styles.antennaStem}>
            <motion.div
              style={{ ...styles.antennaBall, background: "#60a5fa" }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          <div style={styles.visorScreen}>
            <div style={styles.eyesRow}>
              <motion.div
                style={styles.idleEye}
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.6, 0.65, 1] }}
              />
              <motion.div
                style={styles.idleEye}
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.6, 0.65, 1] }}
              />
            </div>
            <div style={styles.idleMouth} />
          </div>
        </div>

        <div style={styles.feetRow}>
          <div style={{ ...styles.foot, background: "#1e40af" }} />
          <div style={{ ...styles.foot, background: "#1e40af" }} />
        </div>
      </motion.div>

      <div style={styles.caption}>
        <span style={{ ...styles.tag, background: "#e0f2fe", color: "#0369a1" }}>
          🤖 Ready to Analyze
        </span>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "170px",
    position: "relative",
    margin: "10px 0"
  },
  mascotWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  characterContainer: {
    position: "relative",
    width: "120px",
    height: "115px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  floatingIcon: {
    position: "absolute",
    fontSize: "20px",
    pointerEvents: "none",
    zIndex: 5
  },
  fallingTear: {
    position: "absolute",
    width: "6px",
    height: "12px",
    background: "#38bdf8",
    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
    zIndex: 10,
    boxShadow: "0 0 6px #38bdf8"
  },
  robotHead: {
    width: "100px",
    height: "85px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    zIndex: 2
  },
  antennaStem: {
    position: "absolute",
    top: "-14px",
    width: "3px",
    height: "14px",
    background: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    justifyContent: "center"
  },
  antennaBall: {
    position: "absolute",
    top: "-7px",
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  },
  visorScreen: {
    width: "80px",
    height: "55px",
    background: "#090d16",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  },
  happyEyesRow: {
    display: "flex",
    gap: "18px",
    marginTop: "2px"
  },
  crescentEye: {
    width: "14px",
    height: "8px",
    borderTop: "3px solid #34d399",
    borderRadius: "14px 14px 0 0",
    filter: "drop-shadow(0 0 4px #34d399)"
  },
  cheeksRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "56px",
    marginTop: "1px"
  },
  blush: {
    width: "7px",
    height: "4px",
    borderRadius: "50%",
    opacity: 0.7
  },
  bigSmile: {
    width: "20px",
    height: "9px",
    borderBottom: "3px solid #34d399",
    borderRadius: "0 0 20px 20px",
    marginTop: "1px",
    filter: "drop-shadow(0 0 4px #34d399)"
  },
  eyesRow: {
    display: "flex",
    gap: "18px",
    alignItems: "center"
  },
  neutralPupil: {
    width: "11px",
    height: "11px",
    background: "#fbbf24",
    borderRadius: "50%",
    boxShadow: "0 0 8px #fbbf24"
  },
  neutralMouth: {
    height: "3px",
    background: "#fbbf24",
    borderRadius: "2px",
    marginTop: "8px",
    boxShadow: "0 0 6px #fbbf24"
  },
  angryEyesRow: {
    display: "flex",
    gap: "12px",
    marginTop: "2px"
  },
  eyeWithBrow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  brow: {
    width: "14px",
    height: "3px",
    background: "#fca5a5",
    borderRadius: "2px",
    marginBottom: "3px"
  },
  angryPupil: {
    fontSize: "12px",
    lineHeight: 1
  },
  frownMouth: {
    width: "22px",
    height: "8px",
    borderTop: "3px solid #f87171",
    borderRadius: "22px 22px 0 0",
    marginTop: "5px",
    filter: "drop-shadow(0 0 4px #ef4444)"
  },
  idleEye: {
    width: "10px",
    height: "10px",
    background: "#60a5fa",
    borderRadius: "50%",
    boxShadow: "0 0 8px #60a5fa"
  },
  idleMouth: {
    width: "14px",
    height: "2px",
    background: "#60a5fa",
    borderRadius: "2px",
    marginTop: "8px"
  },
  arm: {
    position: "absolute",
    zIndex: 1
  },
  hand: {
    fontSize: "14px"
  },
  feetRow: {
    display: "flex",
    gap: "24px",
    marginTop: "-3px"
  },
  foot: {
    width: "16px",
    height: "10px",
    borderRadius: "4px 4px 6px 6px"
  },
  caption: {
    marginTop: "8px"
  },
  tag: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
  }
};
