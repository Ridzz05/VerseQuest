# VerseQuest

A browser-based, mood-driven karaoke trainer. Pick a vibe, find a song (via AI or
direct YouTube search), sing along to the backing track, and get real-time accuracy
scoring powered by the Web Speech API.

> "Cultivate your vibe." — pick a mood, complete a singing quest, gain XP.

## Features

- **Mood stations** — happy, calm, nostalgic, melancholic playlists.
- **AI song discovery** — describe a song or paste lyrics; an LLM resolves metadata.
- **Direct YouTube search** — resolves a real, embeddable karaoke/backing-track video
  via the YouTube Data API (no more guessed video IDs).
- **Live scoring** — the browser transcribes what you sing and scores word-match accuracy.
- **Auto-scrolling lyrics** synced to the YouTube track, mood avatar, and audio visualizer.
- **No backend** — pure React + Vite SPA; everything runs in the browser.

## Tech Stack

- React 19 + Vite 8
- Web Speech API (speech recognition)
- YouTube IFrame Player API (embedded backing tracks)
- AgentRouter / OpenAI-compatible LLM for song metadata
- YouTube Data API v3 for direct video search

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # Vite dev server (UI)
npm run proxy          # local CORS proxy for the AI calls (port 3001)
```

Open the Vite URL (default http://localhost:5173). Keep the proxy running in a
separate terminal, otherwise AI search will fail with a connection error.

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_KEY` | AgentRouter (or other OpenAI-compatible) API key for AI song metadata. Falls back to the in-app Settings panel. |
| `VITE_API_BASE_URL` | API base URL (default `https://agentrouter.org/v1`). |
| `VITE_API_MODEL` | Model ID (default `claude-opus-4-8`). |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API v3 key for direct video search. Optional — without it, the app falls back to the AI-provided ID and a manual search link. |

`.env` is git-ignored so secrets are never committed.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server. |
| `npm run proxy` | Start the local CORS proxy (port 3001). |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Preview the production build. |
| `npm run lint` | Lint with Oxlint. |

## Project Structure

```
src/
  components/        # UI: MoodSelector, SongSelector, SingingRoom, AISearchDrawer,
                     # YoutubePlayer, AudioVisualizer, GameAvatar, ScoreBoard
  hooks/             # useSpeechToText (Web Speech API)
  utils/             # youtubeSearch (YouTube Data API)
  data/songs.json    # Built-in mood playlists
proxy.cjs            # Local CORS proxy for AI API calls
```
