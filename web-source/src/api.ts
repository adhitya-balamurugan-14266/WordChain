// API URL for the wordchain_api function.
// During catalyst serve (local dev), the proxy in vite.config.ts rewrites /server → Catalyst dev domain.
// In production (client hosting), same relative path works because everything is on the same Catalyst domain.
const API_URL = '/server/wordchain_api/execute';

export interface GameState {
  valid: boolean;
  reason?: string;
  chain: string[];
  ai_word?: string | null;
  next_letter: string | null;
  lives: number;
  round: number;
  game_over: boolean;
  game_over_reason?: string;
  session_id?: string;
  round_deadline?: number;   // Unix ms timestamp — when this round expires
  timeout_seconds?: number;  // How many seconds for this round
}

export interface LeaderboardEntry {
  PlayerName: string;
  Score: number;
  ChainLength: number;
  ROWID?: string;
}

async function call(body: Record<string, unknown>): Promise<unknown> {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function startGame(): Promise<GameState> {
  return call({ action: 'start' }) as Promise<GameState>;
}

export async function playWord(sessionId: string, word: string): Promise<GameState> {
  return call({ action: 'play', sessionId, word }) as Promise<GameState>;
}

export async function timeoutTurn(sessionId: string): Promise<GameState> {
  return call({ action: 'timeout', sessionId }) as Promise<GameState>;
}

export async function saveScore(
  sessionId: string,
  playerName: string,
  score: number,
  chainLength: number
): Promise<{ saved: boolean; score: number; chainLength: number; playerName: string }> {
  return call({ action: 'save_score', sessionId, playerName, score, chainLength }) as Promise<{
    saved: boolean;
    score: number;
    chainLength: number;
    playerName: string;
  }>;
}

export async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return call({ action: 'leaderboard' }) as Promise<{ leaderboard: LeaderboardEntry[] }>;
}
