# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A real-time multiplayer D&D dice roller web app. Players join a shared room by code, roll dice, and see each other's results live. No database — all state is in-memory on the server.

## Dev commands

Two processes must run simultaneously:

```powershell
# Terminal 1 — backend (port 3001)
cd server
npm install       # first time only
npm run dev       # nodemon, auto-restarts on changes

# Terminal 2 — frontend (port 5173)
cd client
npm install       # first time only
npm run dev       # Vite dev server
```

Open **http://localhost:5173**. The Vite dev server proxies all `/socket.io` traffic to the backend — no CORS config needed in development.

Production build:
```powershell
cd client && npm run build   # outputs to client/dist/
NODE_ENV=production node server/src/index.js   # Express serves client/dist/
```

## Architecture

### Request / data flow

```
Browser (React)
  └─ socket.io-client ──WS──► Express + socket.io (server/src/index.js)
                                  ├─ rooms.js   in-memory room & player state
                                  └─ dice.js    parse + roll notation
```

The socket is a **singleton** (`client/src/socket.js`) created with `autoConnect: false` and connected/disconnected explicitly inside the `Room` page's `useEffect`. A `joined` ref guards against React StrictMode double-mounting firing `join` twice.

### Socket.io event protocol

| Direction | Event | Payload |
|---|---|---|
| client → server | `join` | `{ roomCode, playerName }` |
| client → server | `roll` | `{ notation }` — e.g. `"2d6+3"` |
| server → joining client | `init` | `{ you, players[], log[] }` |
| server → room | `roll:result` | `{ player, notation, rolls[], sides, total, breakdown, ts }` |
| server → room | `system` | `{ msg, players[], ts }` |
| server → sender | `error` | `{ msg }` |

### Room state (server-side, in-memory)

```js
rooms = {
  "ABCD": { code, players: string[], log: RollEntry[] }
}
```

Rooms are deleted when the last player disconnects. The log is capped at 50 entries (`MAX_LOG` in `rooms.js`). New joiners receive the full log in the `init` event.

### Dice notation

`server/src/dice.js` (and `client/src/socket.js` routes through it server-side). Supported format: `(\d*)d(\d+)([+-]\d+)?` — e.g. `d20`, `1d20`, `2d6+3`, `1d8-1`. Count 1–100, sides ≥ 2. Critical hit / fumble detection happens client-side in `RollLog.jsx`: `sides === 20 && rolls.includes(20/1)`.

### Client routing

React Router handles two routes:
- `/` → `Home.jsx` — name input + room code (client-side generated, no server call needed)
- `/room/:code?name=X` → `Room.jsx` — the game room; player name comes from the query string

All styling is a single global file: `client/src/index.css`. No CSS modules, no Tailwind. CSS custom properties for the dark D&D theme are defined in `:root`.

## Key constraints

- **No database.** Restarting the server clears all rooms and logs.
- **No auth.** Player identity is just the name string within a room. Duplicate names get a numeric suffix appended server-side.
- **Node.js required** — the old Python/FastAPI backend (`src/`, `run.py`, `requirements.txt`, `static/`) is superseded by `server/` and `client/` but not yet removed from the repo.
