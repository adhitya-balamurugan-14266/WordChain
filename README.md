# WordChain

An AI-powered word chain game built on **Zoho Catalyst** where players compete against an AI opponent in a turn-based word challenge. Chain words together, outsmart the AI, and climb the leaderboard.

---

## How to Play

1. The AI starts by playing an opening word.
2. You must respond with a valid English word that **starts with the last letter** of the AI's word.
3. The AI then responds with a word starting with the last letter of your word.
4. The chain continues — whoever runs out of valid words loses.

**Rules:**
- Words must be **at least 3 letters** long.
- Only English alphabet characters (A–Z) are allowed.
- Words **cannot be repeated** within the same game.
- Each word is validated against the [Free Dictionary API](https://api.dictionaryapi.dev).
- You have **3 lives** — lose one for each invalid word or timed-out turn.

---

## Game Mechanics

### Timer
| Rounds | Time per Turn |
|--------|--------------|
| 1 – 3  | 60 seconds   |
| 4+     | Decreases by 5 seconds per round (minimum 10 seconds) |

### AI Difficulty
The AI strategically selects words whose endings get progressively harder to respond to:

| Rounds | AI Preferred Endings |
|--------|----------------------|
| 1 – 5  | Easy: A, D, E, I, L, N, O, R, S, T |
| 6 – 10 | Medium: B, C, G, H, M, P, U, Y |
| 11 – 15 | Hard: F, J, K, V, W, X |
| 16+    | Very Hard: Q, Z |

### Scoring
- **Score** = number of rounds survived.
- **Chain Length** = total words played in the game.
- Top 10 scores are displayed on the leaderboard.
- If the AI runs out of valid words, **you win**.

---

## Stack & Services

### Frontend & Backend Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | Game UI & state management |
| Build Tool | Vite 5 | Dev server, bundling, and `/app/` base path config |
| Styling | TailwindCSS 3 | Dark theme, responsive layout, custom animations |
| Backend Runtime | Node.js 20 | Catalyst Serverless Function environment |
| HTTP Client (backend) | node-fetch 2 | Dictionary API calls from the function |
| Dictionary Validation | Free Dictionary API | Real-time word validation |

### Catalyst Services Used

| Catalyst Service | How It's Used |
|-----------------|--------------|
| **Serverless Functions** | `wordchain_api` handles all game logic — session creation, word validation, AI moves, scoring, and leaderboard reads/writes |
| **Cloud Scale Cache** | Stores game sessions (2-hour TTL) and the global leaderboard (1-year TTL) without requiring user authentication |
| **Catalyst Slate** | Serves the compiled React app as static assets at the `/app/` path on the Catalyst domain |

### Catalyst MCP

This project was built with the assistance of **Catalyst MCP (Model Context Protocol)**. The MCP server exposes Catalyst platform capabilities as tools that an AI agent can call directly — enabling end-to-end development without leaving the editor.

| MCP Capability Used | What It Did |
|--------------------|-------------|
| Project & resource introspection | Explored Catalyst project config, functions, and cache segments during development |
| Cache operations | Read and wrote leaderboard and session data via MCP tools during testing |
| Function management | Inspected and updated function configurations |
| Guided code generation | AI agent used MCP context to generate correct SDK usage patterns (`zcatalyst-sdk-node`) |

---

## Project Structure

```
WordChain/
├── catalyst.json                  # Catalyst deployment configuration
├── client/                        # Compiled frontend assets (Vite build output)
│   └── assets/
├── web-source/                    # Frontend source code
│   ├── src/
│   │   ├── App.tsx                # Main game component & UI logic
│   │   ├── api.ts                 # API client (fetch wrappers & types)
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # TailwindCSS + custom component styles
│   ├── vite.config.ts             # Vite config (base: /app/, dev proxy)
│   ├── tailwind.config.js
│   └── package.json
└── functions/
    └── wordchain_api/             # Catalyst serverless function (backend)
        ├── index.js               # Main request handler (~600 lines)
        ├── words.js               # Word lists & AI word-picking logic
        └── package.json
```

---

## API Reference

All requests go to `POST /server/wordchain_api/execute` with a JSON body.

| Action | Payload | Description |
|--------|---------|-------------|
| `start` | `{ action: 'start' }` | Start a new game session |
| `play` | `{ action: 'play', session_id, word }` | Submit a word |
| `timeout` | `{ action: 'timeout', session_id }` | Signal a timed-out turn |
| `save_score` | `{ action: 'save_score', session_id, name, score, chain_length }` | Save score to leaderboard |
| `leaderboard` | `{ action: 'leaderboard' }` | Fetch top 10 scores |

---

## Local Development

### Prerequisites
- Node.js 20+
- [Catalyst CLI](https://docs.catalyst.zoho.com/en/cli/v1/help-command/) installed and authenticated

### Frontend

```bash
cd web-source
npm install
npm run dev
```

The Vite dev server proxies `/server/*` requests to your Catalyst development domain (configured in `vite.config.ts`).

### Backend

```bash
cd functions/wordchain_api
npm install
```

Run the full project locally using the Catalyst CLI from the project root:

```bash
catalyst serve
```

### Build for Deployment

```bash
# Build frontend assets into client/
cd web-source
npm run build

# Deploy to Catalyst from project root
cd ..
catalyst deploy
```

---

## Architecture Notes

- **Session management** uses Catalyst Cloud Scale Cache (no auth required) — each session expires after 2 hours.
- **Leaderboard** is stored in the same cache segment under a reserved key and expires after 1 year.
- The dictionary API has a **5-second timeout**; if unreachable, words are accepted to keep gameplay flowing.
- In production, the frontend and backend share the same Catalyst domain, so the `/server/...` path works without any proxy configuration.

---

## Live Application

[https://wordchain.onslate.in](https://wordchain.onslate.in)
