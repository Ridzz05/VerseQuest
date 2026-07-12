import React, { useState } from "react";
import { MoodSelector } from "./components/MoodSelector";
import { SongSelector } from "./components/SongSelector";
import { SingingRoom } from "./components/SingingRoom";
import { ScoreBoard } from "./components/ScoreBoard";
import { AISearchDrawer } from "./components/AISearchDrawer";

function App() {
  const [gameState, setGameState] = useState("mood_selection"); // mood_selection, song_selection, ai_search, singing_room, score_board
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);
  
  // Custom songs added by AI or manual forms
  const [customSongs, setCustomSongs] = useState([]);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    setGameState("song_selection");
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setGameState("singing_room");
  };

  const handleAddSong = (newSong) => {
    setCustomSongs((prev) => [newSong, ...prev]);
    setSelectedSong(newSong);
    setGameState("singing_room"); // Instantly launch the singing room for the new song!
  };

  const handleFinishSinging = (results) => {
    setSessionResults(results);
    setGameState("score_board");
  };

  const handleRestart = () => {
    setSelectedMood(null);
    setSelectedSong(null);
    setSessionResults(null);
    setGameState("mood_selection");
  };

  return (
    <div className="app-wrapper">
      <main className="app-main">
        {gameState === "mood_selection" && (
          <MoodSelector onSelectMood={handleSelectMood} />
        )}
        
        {gameState === "song_selection" && (
          <SongSelector
            mood={selectedMood}
            customSongs={customSongs}
            onSelectSong={handleSelectSong}
            onAddSongClick={() => setGameState("ai_search")}
            onBack={() => setGameState("mood_selection")}
          />
        )}

        {gameState === "ai_search" && (
          <AISearchDrawer
            mood={selectedMood}
            onAddSong={handleAddSong}
            onBack={() => setGameState("song_selection")}
          />
        )}
        
        {gameState === "singing_room" && (
          <SingingRoom
            song={selectedSong}
            mood={selectedMood}
            onFinish={handleFinishSinging}
            onBack={() => setGameState("song_selection")}
          />
        )}
        
        {gameState === "score_board" && (
          <ScoreBoard
            results={sessionResults}
            onRestart={handleRestart}
          />
        )}
      </main>

      <footer className="app-footer">
        Music Farm &copy; {new Date().getFullYear()} &bull; Cultivate your vibe
      </footer>
    </div>
  );
}

export default App;
