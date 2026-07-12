import React, { useState, useEffect, useRef } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { AudioVisualizer } from "./AudioVisualizer";
import { GameAvatar } from "./GameAvatar";
import { YoutubePlayer } from "./YoutubePlayer";
import { ArrowLeft, Mic, MicOff, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export const SingingRoom = ({ song, mood, onFinish, onBack }) => {
  const {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
  } = useSpeechToText();

  const [volume, setVolume] = useState(0);
  const [matchedWords, setMatchedWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [currentYoutubeId, setCurrentYoutubeId] = useState(song.youtubeId);
  const [showSwapper, setShowSwapper] = useState(false);
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    setCurrentYoutubeId(song.youtubeId);
  }, [song]);

  const extractYoutubeId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  // Clean word helper
  const cleanWord = (word) =>
    word
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=-_`~()?'"’]/g, "")
      .trim();

  // Extract all words
  const allSongWords = song.lyricsDisplay
    .flatMap((line) => line.split(/\s+/))
    .map(cleanWord)
    .filter((word) => word.length > 0);

  const totalUniqueWords = new Set(allSongWords).size;

  // Track matched words
  useEffect(() => {
    if (!transcript) return;

    const transcriptWords = transcript.split(/\s+/).map(cleanWord);
    const newMatches = new Set();

    transcriptWords.forEach((word) => {
      if (allSongWords.includes(word)) {
        newMatches.add(word);
      }
    });

    setMatchedWords(newMatches);

    if (totalUniqueWords > 0) {
      const percentage = Math.round((newMatches.size / totalUniqueWords) * 100);
      setScore(percentage);
    }
  }, [transcript, allSongWords, totalUniqueWords]);

  // Determine active line index based on completion
  const getActiveLineIndex = () => {
    for (let i = 0; i < song.lyricsDisplay.length; i++) {
      const lineWords = song.lyricsDisplay[i]
        .split(/\s+/)
        .map(cleanWord)
        .filter((w) => w.length > 0);

      const matchedInLine = lineWords.filter((w) => matchedWords.has(w)).length;
      
      if (lineWords.length > 0 && matchedInLine < lineWords.length * 0.75) {
        return i;
      }
    }
    return song.lyricsDisplay.length - 1; // Default to last line
  };

  const activeLineIdx = getActiveLineIndex();

  // Scroll active line into center of lyrics box
  useEffect(() => {
    const activeLineEl = document.getElementById(`lyric-line-${activeLineIdx}`);
    if (activeLineEl && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const topPos = activeLineEl.offsetTop;
      const containerHeight = container.clientHeight;
      const elHeight = activeLineEl.clientHeight;
      
      container.scrollTo({
        top: topPos - containerHeight / 2 + elHeight / 2,
        behavior: "smooth"
      });
    }
  }, [activeLineIdx]);

  const handleFinish = () => {
    stopListening();
    onFinish({
      score,
      matchedCount: matchedWords.size,
      totalCount: totalUniqueWords,
      songTitle: song.title,
      songArtist: song.artist,
      mood
    });
  };

  const renderWord = (rawWord, index) => {
    const cleaned = cleanWord(rawWord);
    const isMatched = matchedWords.has(cleaned);
    return (
      <span key={index} className={`lyric-word ${isMatched ? "matched" : ""}`}>
        {rawWord}{" "}
      </span>
    );
  };

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      <div className="paper-sheet">
        <div className="header-row">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Playlist</span>
          </button>
          <div className="live-score">
            Singing Accuracy: <span className="score-num">{score}%</span>
          </div>
        </div>

        <div className="singing-layout">
          {/* Left Panel: YouTube Player, Visualizer & Avatar */}
          <div className="left-panel">
            <YoutubePlayer youtubeId={currentYoutubeId} isPlaying={isListening} />
            
            {/* Collapsible video swapper panel */}
            <div className="hud-panel" style={{ padding: "0.75rem", borderRadius: "14px" }}>
              <button 
                onClick={() => setShowSwapper(!showSwapper)} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  width: "100%", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  fontFamily: "var(--font-mono)", 
                  fontSize: "11px", 
                  color: "var(--ink)", 
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                <span>🎥 YOUTUBE BACKING TRACK ERROR?</span>
                {showSwapper ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSwapper && (
                <div style={{ marginTop: "0.6rem" }}>
                  <input
                    type="text"
                    placeholder="Paste a new YouTube Video Link..."
                    style={{
                      width: "100%",
                      fontSize: "12px",
                      padding: "0.4rem 0.65rem",
                      borderRadius: "8px",
                      border: "1.5px solid var(--ink)",
                      background: "var(--paper)",
                      color: "var(--ink)",
                      outline: "none"
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.trim()) {
                        setCurrentYoutubeId(extractYoutubeId(val.trim()));
                      }
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="hud-panel" style={{ display: "flex", gap: "1.25rem", alignItems: "center", justifyContent: "flex-start" }}>
              <GameAvatar mood={mood} volume={volume} isListening={isListening} />
              <div style={{ textAlign: "left" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{song.title}</h4>
                <p style={{ margin: 0, fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{song.artist}</p>
                <div style={{ marginTop: "0.4rem" }}>
                  {isListening ? (
                    <span className="pulse-text text-neon">Singing Quest Active...</span>
                  ) : (
                    <span className="text-muted" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>Ready to listen</span>
                  )}
                </div>
              </div>
            </div>

            <div className="visualizer-card">
              <AudioVisualizer
                isListening={isListening}
                mood={mood}
                onVolumeChange={setVolume}
              />
            </div>
          </div>

          {/* Right Panel: Lyrics Box & Controls */}
          <div className="right-panel">
            <div className="lyrics-display-box" ref={lyricsContainerRef}>
              {song.lyricsDisplay.map((line, lineIdx) => {
                const isActive = lineIdx === activeLineIdx;
                const isPast = lineIdx < activeLineIdx;
                return (
                  <p
                    key={lineIdx}
                    id={`lyric-line-${lineIdx}`}
                    className={`lyric-line ${isActive ? "active-line" : ""} ${isPast ? "past-line" : "future-line"}`}
                    style={{
                      opacity: isActive ? 1 : isPast ? 0.45 : 0.2,
                      transform: isActive ? "scale(1.02)" : "scale(1)"
                    }}
                  >
                    {line.split(/\s+/).map((word, wordIdx) =>
                      renderWord(word, `${lineIdx}-${wordIdx}`)
                    )}
                  </p>
                );
              })}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="controls-row">
              {!isListening ? (
                <button className="btn btn-primary start-sing-btn" onClick={startListening} style={{ flex: 1 }}>
                  <Mic size={18} />
                  <span>Start Quest</span>
                </button>
              ) : (
                <button className="btn btn-danger stop-sing-btn" onClick={stopListening} style={{ flex: 1 }}>
                  <MicOff size={18} />
                  <span>Pause Quest</span>
                </button>
              )}

              <button className="btn btn-success finish-btn" onClick={handleFinish}>
                <CheckCircle size={18} />
                <span>Submit</span>
              </button>
            </div>

            <div className="transcript-preview">
              <strong style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em" }}>SUBTITLES: </strong>
              <span className="transcript-text">
                {transcript ? `"${transcript}"` : "Waiting for input..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SingingRoom;
