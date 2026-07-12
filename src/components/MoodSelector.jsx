import React from "react";
import { Sun, Compass, Sparkles, CloudRain } from "lucide-react";

export const MoodSelector = ({ onSelectMood }) => {
  const moods = [
    {
      id: "happy",
      glyph: "H",
      icon: <Sun size={20} />,
      label: "Happy",
      description: "Energetic, bright & full of positive vibes!",
      tileClass: "q-happy",
      xp: "+90 XP"
    },
    {
      id: "calm",
      glyph: "C",
      icon: <Compass size={20} />,
      label: "Calm",
      description: "Relaxed, peaceful & slow acoustic tunes.",
      tileClass: "q-calm",
      xp: "+70 XP"
    },
    {
      id: "nostalgic",
      glyph: "N",
      icon: <Sparkles size={20} />,
      label: "Nostalgic",
      description: "Classics & oldies that bring back memories.",
      tileClass: "q-nostalgic",
      xp: "+80 XP"
    },
    {
      id: "melancholic",
      glyph: "M",
      icon: <CloudRain size={20} />,
      label: "Melancholic",
      description: "Deep, emotional & beautiful sad songs.",
      tileClass: "q-melancholic",
      xp: "+60 XP"
    }
  ];

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      <div className="paper-sheet text-center">
        <span className="level-badge" style={{ marginBottom: "1rem" }}>
          <span className="dot"></span>SAM'S ACCOUNT
        </span>
        <h1>Daily quests for <span className="accent">cultivating</span> your vibe.</h1>
        <p className="subtitle">Level turns your music moods into an active singing quest log. Select a channel to begin.</p>
        
        <div className="quests-grid">
          {moods.map((m) => (
            <button
              key={m.id}
              className={`quest-card ${m.tileClass}`}
              onClick={() => onSelectMood(m.id)}
              style={{ border: "none", outline: "none", font: "inherit", color: "inherit" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div className="glyph">{m.glyph}</div>
                <div style={{ color: "var(--ink)", opacity: 0.6 }}>{m.icon}</div>
              </div>
              <h2 className="q-title" style={{ margin: 0 }}>{m.label}</h2>
              <p className="q-desc" style={{ margin: 0 }}>{m.description}</p>
              <span className="q-xp">{m.xp}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MoodSelector;
