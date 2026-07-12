import React from "react";

export const GameAvatar = ({ mood, volume = 0, isListening = false }) => {
  const pulse = Math.min(volume / 50, 1.5);
  
  const getFacePaths = () => {
    switch (mood) {
      case "happy":
        return {
          eyes: (
            <>
              <path d="M28 35 Q35 25 42 35" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M58 35 Q65 25 72 35" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ),
          mouth: isListening && volume > 15 ? (
            <ellipse cx="50" cy="55" rx={12 + pulse * 4} ry={10 + pulse * 6} fill="#ff7a52" stroke="#1a1714" strokeWidth="3" />
          ) : (
            <path d="M40 52 Q50 62 60 52" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" fill="none" />
          ),
          color: "var(--tile-happy)",
          cheeks: (
            <>
              <circle cx="26" cy="42" r="5" fill="#ff7a52" opacity="0.4" />
              <circle cx="74" cy="42" r="5" fill="#ff7a52" opacity="0.4" />
            </>
          )
        };
      case "calm":
        return {
          eyes: (
            <>
              <path d="M28 36 Q35 41 42 36" stroke="#1a1714" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M58 36 Q65 41 72 36" stroke="#1a1714" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ),
          mouth: isListening && volume > 15 ? (
            <ellipse cx="50" cy="52" rx={7 + pulse * 2} ry={6 + pulse * 3} fill="#6cba5b" stroke="#1a1714" strokeWidth="3" />
          ) : (
            <path d="M44 50 Q50 54 56 50" stroke="#1a1714" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          ),
          color: "var(--tile-calm)",
          cheeks: null
        };
      case "nostalgic":
        return {
          eyes: (
            <>
              <circle cx="35" cy="35" r="5" fill="#1a1714" />
              <circle cx="65" cy="35" r="5" fill="#1a1714" />
              <circle cx="33" cy="33" r="1.8" fill="#ffffff" />
              <circle cx="63" cy="33" r="1.8" fill="#ffffff" />
            </>
          ),
          mouth: isListening && volume > 15 ? (
            <ellipse cx="50" cy="55" rx={10 + pulse * 3} ry={8 + pulse * 4} fill="#f0b54a" stroke="#1a1714" strokeWidth="3" />
          ) : (
            <path d="M42 53 Q50 49 58 53" stroke="#1a1714" strokeWidth="3" strokeLinecap="round" fill="none" />
          ),
          color: "var(--tile-nostalgic)",
          cheeks: (
            <>
              <circle cx="28" cy="42" r="4" fill="#f0b54a" opacity="0.4" />
              <circle cx="72" cy="42" r="4" fill="#f0b54a" opacity="0.4" />
            </>
          )
        };
      case "melancholic":
        return {
          eyes: (
            <>
              <path d="M28 32 L38 35" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" />
              <path d="M72 32 L62 35" stroke="#1a1714" strokeWidth="4" strokeLinecap="round" />
              <circle cx="33" cy="40" r="3.5" fill="#1a1714" />
              <circle cx="67" cy="40" r="3.5" fill="#1a1714" />
            </>
          ),
          mouth: isListening && volume > 15 ? (
            <ellipse cx="50" cy="54" rx={8 + pulse * 2} ry={6 + pulse * 4} fill="#b08bf2" stroke="#1a1714" strokeWidth="3" />
          ) : (
            <path d="M44 54 Q50 48 56 54" stroke="#1a1714" strokeWidth="3" strokeLinecap="round" fill="none" />
          ),
          color: "var(--tile-melancholic)",
          cheeks: (
            <>
              <circle cx="26" cy="45" r="4" fill="#b08bf2" opacity="0.3" />
              <circle cx="74" cy="45" r="4" fill="#b08bf2" opacity="0.3" />
            </>
          )
        };
      default:
        return {
          eyes: (
            <>
              <circle cx="35" cy="35" r="4" fill="#1a1714" />
              <circle cx="65" cy="35" r="4" fill="#1a1714" />
            </>
          ),
          mouth: <path d="M40 50 Q50 58 60 50" stroke="#1a1714" strokeWidth="3" strokeLinecap="round" fill="none" />,
          color: "var(--line)",
          cheeks: null
        };
    }
  };

  const face = getFacePaths();

  return (
    <div className={`avatar-container ${isListening && volume > 20 ? "singing-bounce" : "gentle-float"}`}>
      <svg
        width="110"
        height="110"
        viewBox="0 0 100 100"
        style={{
          filter: "drop-shadow(3px 3px 0px var(--ink))"
        }}
      >
        {/* Main Body */}
        <circle
          cx="50"
          cy="50"
          r={41 + pulse * 1.5}
          fill={face.color}
          stroke="var(--ink)"
          strokeWidth="3.5"
          style={{ transition: "r 0.1s ease-out" }}
        />

        {/* Cheek elements */}
        {face.cheeks}

        {/* Face components */}
        <g style={{ transform: `translate(0px, ${pulse * 1.2}px)` }}>
          {face.eyes}
          {face.mouth}
        </g>

        {/* Leaf on head - Farm motif */}
        <path
          d="M50 9 Q45 3 38 5 Q43 13 50 9 Z"
          fill="var(--color-success)"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
        <path
          d="M50 9 Q55 3 62 5 Q57 13 50 9 Z"
          fill="#4f9b3e"
          stroke="var(--ink)"
          strokeWidth="1.5"
        />
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        .avatar-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gentle-float {
          animation: float 4s ease-in-out infinite;
        }
        .singing-bounce {
          animation: bounce 0.4s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bounce {
          0% { transform: scale(1) translateY(0px); }
          100% { transform: scale(1.03) translateY(-4px); }
        }
      `}} />
    </div>
  );
};
export default GameAvatar;
