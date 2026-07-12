import React from "react";
import songsData from "../data/songs.json";
import { ArrowLeft, Play, Sparkles, Plus } from "lucide-react";

export const SongSelector = ({ mood, customSongs = [], onSelectSong, onAddSongClick, onBack }) => {
  const defaultSongs = songsData[mood] || [];
  const songs = [...defaultSongs, ...customSongs];

  const moodGlyphs = {
    happy: "H",
    calm: "C",
    nostalgic: "N",
    melancholic: "M"
  };

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      <div className="paper-sheet">
        <div className="header-row">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Channels</span>
          </button>
          <button className="back-btn" onClick={onAddSongClick} style={{ background: "var(--ink)", color: "#f5efe4" }}>
            <Sparkles size={14} />
            <span>AI Search</span>
          </button>
        </div>

        <div className="level-ribbon">
          <div className="lv">{moodGlyphs[mood] || "Q"}</div>
          <div className="meta">
            <div className="label">ACTIVE VIBE STATION</div>
            <div className="name" style={{ textTransform: "capitalize" }}>{mood} Playlist Log</div>
          </div>
          <div className="xp">{songs.length} quests available</div>
          <div className="bar"><span style={{ width: "66%" }}></span></div>
        </div>

        <div className="song-list">
          {/* Quick option to add a song */}
          <div 
            className="song-card add-song-placeholder" 
            onClick={onAddSongClick}
            style={{
              borderStyle: "dashed",
              borderColor: "var(--line)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              background: "rgba(0, 0, 0, 0.01)",
              padding: "0.85rem"
            }}
          >
            <Plus size={16} style={{ color: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Search / Request custom backing track
            </span>
          </div>

          {songs.map((song) => {
            const isCustom = song.id.toString().startsWith("custom_");
            return (
              <div key={song.id} className="song-card">
                <div className="song-info">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 className="song-title">{song.title}</h3>
                    {isCustom && (
                      <span className="custom-badge-pill">AI</span>
                    )}
                  </div>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <button className="play-btn" onClick={() => onSelectSong(song)}>
                  <Play size={14} fill="currentColor" />
                  <span>Sing</span>
                </button>
              </div>
            );
          })}

          {songs.length === 0 && (
            <p className="text-center text-muted" style={{ padding: "1.5rem 0" }}>No tracks listed for this mood yet.</p>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-badge-pill {
          background: var(--tile-calm);
          border: 1px solid var(--ink);
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
        }
      `}} />
    </div>
  );
};
export default SongSelector;
