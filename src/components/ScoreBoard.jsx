import React from "react";
import { GameAvatar } from "./GameAvatar";
import { RotateCcw, Music, Award } from "lucide-react";

export const ScoreBoard = ({ results, onRestart }) => {
  const { score, matchedCount, totalCount, songTitle, songArtist, mood } = results;

  const getFeedback = () => {
    if (score >= 80) {
      return {
        title: "Spectacular Vibe!",
        text: `Incredible performance! You brought the perfect energy for ${songTitle}. Your mood is absolutely glowing! Sam, you gained 430 XP. 🌟`,
        class: "feedback-gold",
        badge: "VIBE MASTER"
      };
    } else if (score >= 50) {
      return {
        title: "Lovely Melodies!",
        text: `Great job! You matched the mood beautifully. With a bit more practice, you'll be a Music Farm superstar! Gained 280 XP. 🎤`,
        class: "feedback-silver",
        badge: "MELODY STAR"
      };
    } else {
      return {
        title: "Heartfelt Effort!",
        text: `Nice try! The important thing is that singing makes you feel good. Let's select another song and try again! Gained 120 XP. 🎵`,
        class: "feedback-bronze",
        badge: "HEART SINGERS"
      };
    }
  };

  const feedback = getFeedback();

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      <div className="paper-sheet text-center">
        <h1 style={{ marginBottom: "1.5rem" }}>Quest <span className="accent">complete</span> Sam!</h1>
        
        <div className="score-summary-card">
          <div className="score-circle-container">
            <div className="score-circle" style={{ background: "var(--tile-happy)", border: "2px solid var(--ink)" }}>
              <span className="score-value">{score}%</span>
              <span className="score-label">ACCURACY</span>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--ink)", color: "#f5efe4", padding: "4px 10px", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "11px", marginBottom: "1rem", fontWeight: 700 }}>
            <Award size={14} style={{ color: "var(--accent)" }} />
            <span>{feedback.badge}</span>
          </div>

          <h2 className="feedback-title" style={{ color: "var(--ink)" }}>{feedback.title}</h2>
          <p className="feedback-text">{feedback.text}</p>

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-val">{matchedCount} / {totalCount}</span>
              <span className="stat-lbl">Words Sang</span>
            </div>
            <div className="stat-box">
              <span className="stat-val" style={{ textTransform: "capitalize" }}>{mood}</span>
              <span className="stat-lbl">Mood Channel</span>
            </div>
          </div>

          <div className="song-badge-container" style={{ border: "1.5px solid var(--ink)" }}>
            <Music size={12} style={{ color: "var(--accent)" }} />
            <span>{songTitle} — {songArtist}</span>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <GameAvatar mood={mood} volume={score > 50 ? 40 : 10} isListening={false} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={onRestart} style={{ margin: "0 auto" }}>
          <RotateCcw size={16} />
          <span>Select Another Quest</span>
        </button>
      </div>
    </div>
  );
};
export default ScoreBoard;
