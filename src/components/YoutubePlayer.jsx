import React, { useEffect, useRef, useState } from "react";

let apiPromise = null;

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };

    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });

  return apiPromise;
}

const EMBED_DISABLED_CODES = [101, 150];

export const YoutubePlayer = ({ youtubeId, isPlaying }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const [error, setError] = useState(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!youtubeId) return undefined;
    let cancelled = false;
    setError(null);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (isPlayingRef.current) event.target.playVideo();
          },
          onError: (event) => {
            setError(event.data);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, [youtubeId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.playVideo !== "function") return;
    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying]);

  if (!youtubeId) {
    return (
      <div className="youtube-player-placeholder">
        <span>Acapella Vibe Active (No video)</span>
      </div>
    );
  }

  const embedBlocked = error && EMBED_DISABLED_CODES.includes(error);

  return (
    <div className="youtube-player-wrapper">
      <div key={youtubeId} ref={containerRef} />
      {embedBlocked && (
        <div className="youtube-error-note">
          This video&apos;s owner disabled embedding (code {error}). Use the swapper below
          to paste a different YouTube link, or search one
          {" "}
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent("karaoke " + youtubeId)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>.
        </div>
      )}
    </div>
  );
};

export default YoutubePlayer;
