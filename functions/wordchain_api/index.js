'use strict';
const catalyst = require('zcatalyst-sdk-node');
const fetch = require('node-fetch');
const { pickAIWord, isInWordList } = require('./words');
const { v4: uuidv4 } = require('crypto');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendJson(res, statusCode, data) {
//   res.writeHead(statusCode, {
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type'
//   });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && Buffer.isBuffer(req.body)) {
      try { return resolve(JSON.parse(req.body.toString())); } catch (e) { return resolve({}); }
    }
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (req.body && typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ─── Game Constants ───────────────────────────────────────────────────────────

const CACHE_SEGMENT_ID = '20660000000135011'; // Console → Cloud Scale → Cache → wordchain_sessions
const LEADERBOARD_CACHE_KEY = '__lb__';        // Special key in the same segment for leaderboard
const LEADERBOARD_TTL_HOURS = 8760;            // 1 year — effectively permanent for a game demo
const SESSION_TTL_HOURS = 2;
const STARTING_LIVES = 3;

// ─── Opening words the AI picks at game start ────────────────────────────────
const OPENING_WORDS = [
  'sphinx', 'quartz', 'waltz', 'vortex', 'jinx',
  'blitz', 'crux', 'lynx', 'onyx', 'flux',
  'apex', 'ibex', 'flex', 'matrix', 'helix'
];

// ─── Timer ────────────────────────────────────────────────────────────────────
/**
 * Returns how many seconds the player has to respond on a given round.
 * Rounds 1-3: 60s (generous)
 * Each subsequent round loses 5s down to a minimum of 10s.
 */
function getTimeoutForRound(round) {
  if (round <= 3) return 60;
  return Math.max(10, 60 - (round - 3) * 5);
}

// ─── Word Validation ──────────────────────────────────────────────────────────

/**
 * Validates a word against the free dictionary API.
 * Returns { valid: true } or { valid: false, reason: '...' }
 */
async function validateWithDictionary(word) {
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
    const resp = await fetch(url, { timeout: 5000 });
    if (resp.status === 404) {
      return { valid: false, reason: `"${word}" is not a recognised English word.` };
    }
    if (!resp.ok) {
      // Dictionary API is unreliable; fall back to accepting the word
      console.warn('Dictionary API error, falling back to allow:', resp.status);
      return { valid: true };
    }
    return { valid: true };
  } catch (err) {
    // Network error – fall back to allow so the game isn't blocked
    console.warn('Dictionary API unreachable, falling back to allow:', err.message);
    return { valid: true };
  }
}

/**
 * Full rule check for a player-submitted word.
 */
async function validatePlayerWord(word, nextLetter, usedWords) {
  const clean = word.trim().toLowerCase();

  if (clean.length < 3) {
    return { valid: false, reason: 'Words must be at least 3 letters long.' };
  }
  if (!/^[a-z]+$/.test(clean)) {
    return { valid: false, reason: 'Only letters are allowed — no numbers, spaces, or special characters.' };
  }
  if (clean[0] !== nextLetter.toLowerCase()) {
    return { valid: false, reason: `Your word must start with the letter "${nextLetter.toUpperCase()}".` };
  }
  if (usedWords.map((w) => w.toLowerCase()).includes(clean)) {
    return { valid: false, reason: `"${word}" has already been used in this chain.` };
  }

  // Check the dictionary (this is the expensive async step)
  return validateWithDictionary(clean);
}

// ─── Session Store (Cache) ────────────────────────────────────────────────────

async function loadSession(catalystApp, sessionId) {
  const segment = catalystApp.cache().segment(CACHE_SEGMENT_ID);
  const raw = await segment.getValue(sessionId);
  return raw ? JSON.parse(raw) : null;
}

async function saveSession(catalystApp, sessionId, state) {
  const segment = catalystApp.cache().segment(CACHE_SEGMENT_ID);
  const json = JSON.stringify(state);
  try {
    await segment.update(sessionId, json);
  } catch (_) {
    // If update fails (key doesn't exist yet), create it
    await segment.put(sessionId, json, SESSION_TTL_HOURS);
  }
}

// ─── Leaderboard (stored in Cache to avoid DataStore auth issues) ─────────────

async function getLeaderboard(catalystApp) {
  const segment = catalystApp.cache().segment(CACHE_SEGMENT_ID);
  try {
    const raw = await segment.getValue(LEADERBOARD_CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

async function saveScore(catalystApp, playerName, score, chainLength) {
  const segment = catalystApp.cache().segment(CACHE_SEGMENT_ID);

  let entries = [];
  try {
    const raw = await segment.getValue(LEADERBOARD_CACHE_KEY);
    if (raw) entries = JSON.parse(raw);
  } catch (_) { /* start fresh if not found */ }

  entries.push({ PlayerName: playerName, Score: score, ChainLength: chainLength });
  entries.sort((a, b) => b.Score - a.Score);
  entries = entries.slice(0, 100); // keep top 100 in cache

  const json = JSON.stringify(entries);
  try {
    await segment.update(LEADERBOARD_CACHE_KEY, json);
  } catch (_) {
    await segment.put(LEADERBOARD_CACHE_KEY, json, LEADERBOARD_TTL_HOURS);
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  // Handle CORS preflight
//   if (req.method === 'OPTIONS') {
//     res.writeHead(204, {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type'
//     });
//     res.end();
//     return;
//   }

  try {
    const catalystApp = catalyst.initialize(req, { type: catalyst.credential.admin });
    const body = await getBody(req);
    const { action, sessionId, word, playerName } = body;

    // ── ACTION: start ─────────────────────────────────────────────────────────
    if (action === 'start') {
      const newSessionId = require('crypto').randomUUID
        ? require('crypto').randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const aiWord = OPENING_WORDS[Math.floor(Math.random() * OPENING_WORDS.length)];
      const nextLetter = aiWord[aiWord.length - 1].toUpperCase();
      const timeoutSeconds = getTimeoutForRound(1);
      const roundDeadline = Date.now() + timeoutSeconds * 1000;

      const state = {
        chain: [aiWord],
        lives: STARTING_LIVES,
        round: 1,
        next_letter: nextLetter,
        game_over: false,
        game_over_reason: null,
        roundDeadline,
        timeoutSeconds
      };

      await saveSession(catalystApp, newSessionId, state);

      return sendJson(res, 200, {
        valid: true,
        chain: state.chain,
        ai_word: aiWord,
        next_letter: nextLetter,
        lives: state.lives,
        round: state.round,
        game_over: false,
        session_id: newSessionId,
        round_deadline: roundDeadline,
        timeout_seconds: timeoutSeconds
      });
    }

    // ── ACTION: play ──────────────────────────────────────────────────────────
    if (action === 'play') {
      if (!sessionId) {
        return sendJson(res, 400, { error: 'Missing sessionId. Start a new game first.' });
      }
      if (!word) {
        return sendJson(res, 400, { error: 'Missing word in request body.' });
      }

      const state = await loadSession(catalystApp, sessionId);
      if (!state) {
        return sendJson(res, 404, { error: 'Session not found or expired. Please start a new game.' });
      }
      if (state.game_over) {
        return sendJson(res, 200, {
          valid: false,
          reason: 'The game is already over. Start a new game.',
          chain: state.chain,
          lives: state.lives,
          round: state.round,
          game_over: true,
          game_over_reason: state.game_over_reason
        });
      }

      // ── Deadline check: treat late submission as a timeout ─────────────────
      if (state.roundDeadline && Date.now() > state.roundDeadline) {
        state.lives -= 1;
        if (state.lives <= 0) {
          state.game_over = true;
          state.game_over_reason = 'Time ran out and you lost your last life!';
          state.roundDeadline = null;
        } else {
          const newTimeoutSeconds = getTimeoutForRound(state.round);
          state.roundDeadline = Date.now() + newTimeoutSeconds * 1000;
          state.timeoutSeconds = newTimeoutSeconds;
        }
        await saveSession(catalystApp, sessionId, state);
        return sendJson(res, 200, {
          valid: false,
          reason: '⏱ Too slow! You lost a life.',
          chain: state.chain,
          next_letter: state.next_letter,
          lives: state.lives,
          round: state.round,
          game_over: state.game_over,
          game_over_reason: state.game_over_reason || undefined,
          round_deadline: state.roundDeadline,
          timeout_seconds: state.timeoutSeconds
        });
      }

      // Validate player's word
      const validation = await validatePlayerWord(word.trim(), state.next_letter, state.chain);

      if (!validation.valid) {
        // Player loses a life; reset deadline for the retry
        state.lives -= 1;
        const gameOver = state.lives <= 0;
        if (gameOver) {
          state.game_over = true;
          state.game_over_reason = 'You ran out of lives!';
          state.roundDeadline = null;
        } else {
          const retryTimeout = getTimeoutForRound(state.round);
          state.roundDeadline = Date.now() + retryTimeout * 1000;
          state.timeoutSeconds = retryTimeout;
        }
        await saveSession(catalystApp, sessionId, state);

        return sendJson(res, 200, {
          valid: false,
          reason: validation.reason,
          chain: state.chain,
          next_letter: state.next_letter,
          lives: state.lives,
          round: state.round,
          game_over: state.game_over,
          game_over_reason: state.game_over_reason || undefined,
          round_deadline: state.roundDeadline,
          timeout_seconds: state.timeoutSeconds
        });
      }

      // Valid player word — add to chain
      const cleanWord = word.trim().toLowerCase();
      state.chain.push(cleanWord);
      state.round += 1;

      // AI picks its word (difficulty scales with round)
      const aiStartLetter = cleanWord[cleanWord.length - 1];
      const aiWord = pickAIWord(aiStartLetter, state.chain, state.round);

      if (!aiWord) {
        // AI can't find a word — AI forfeits, player wins!
        state.game_over = true;
        state.game_over_reason = 'AI forfeits! You win!';
        state.roundDeadline = null;
        await saveSession(catalystApp, sessionId, state);

        return sendJson(res, 200, {
          valid: true,
          chain: state.chain,
          ai_word: null,
          next_letter: null,
          lives: state.lives,
          round: state.round,
          game_over: true,
          game_over_reason: state.game_over_reason
        });
      }

      // AI adds its word
      state.chain.push(aiWord);
      state.round += 1;
      state.next_letter = aiWord[aiWord.length - 1].toUpperCase();

      // Set deadline for the next player turn
      const nextTimeoutSeconds = getTimeoutForRound(state.round);
      state.roundDeadline = Date.now() + nextTimeoutSeconds * 1000;
      state.timeoutSeconds = nextTimeoutSeconds;

      await saveSession(catalystApp, sessionId, state);

      return sendJson(res, 200, {
        valid: true,
        chain: state.chain,
        ai_word: aiWord,
        next_letter: state.next_letter,
        lives: state.lives,
        round: state.round,
        game_over: false,
        round_deadline: state.roundDeadline,
        timeout_seconds: state.timeoutSeconds
      });
    }

    // ── ACTION: timeout ───────────────────────────────────────────────────────
    if (action === 'timeout') {
      if (!sessionId) {
        return sendJson(res, 400, { error: 'Missing sessionId.' });
      }
      const state = await loadSession(catalystApp, sessionId);
      if (!state) {
        return sendJson(res, 404, { error: 'Session not found or expired.' });
      }
      if (state.game_over) {
        return sendJson(res, 200, { valid: false, reason: 'Game already over.', chain: state.chain, lives: state.lives, round: state.round, game_over: true, game_over_reason: state.game_over_reason });
      }

      state.lives -= 1;
      if (state.lives <= 0) {
        state.game_over = true;
        state.game_over_reason = 'Time ran out and you lost your last life!';
        state.roundDeadline = null;
      } else {
        const newTimeoutSeconds = getTimeoutForRound(state.round);
        state.roundDeadline = Date.now() + newTimeoutSeconds * 1000;
        state.timeoutSeconds = newTimeoutSeconds;
      }
      await saveSession(catalystApp, sessionId, state);

      return sendJson(res, 200, {
        valid: false,
        reason: state.game_over ? 'Time ran out and you lost your last life!' : '⏱ Time\'s up! You lost a life.',
        chain: state.chain,
        next_letter: state.next_letter,
        lives: state.lives,
        round: state.round,
        game_over: state.game_over,
        game_over_reason: state.game_over_reason || undefined,
        round_deadline: state.roundDeadline,
        timeout_seconds: state.timeoutSeconds
      });
    }

    // ── ACTION: save_score ────────────────────────────────────────────────────
    if (action === 'save_score') {
      if (!playerName) {
        return sendJson(res, 400, { error: 'Missing playerName.' });
      }
      // Accept score/chainLength from the client body directly (more reliable
      // than loading the session, which may have expired)
      let score = parseInt(body.score, 10);
      let chainLength = parseInt(body.chainLength, 10);

      // Fall back to loading session if client didn't send values
      if (!score || !chainLength) {
        if (sessionId) {
          const state = await loadSession(catalystApp, sessionId);
          if (state) {
            score = score || state.round;
            chainLength = chainLength || state.chain.length;
          }
        }
      }
      if (!score) score = 1;
      if (!chainLength) chainLength = 1;

      const safeName = String(playerName).replace(/[^a-zA-Z0-9 _\-.]/g, '').slice(0, 50) || 'Anonymous';
      await saveScore(catalystApp, safeName, score, chainLength);
      return sendJson(res, 200, { saved: true, score, chainLength, playerName: safeName });
    }

    // ── ACTION: leaderboard ───────────────────────────────────────────────────
    if (action === 'leaderboard') {
      const all = await getLeaderboard(catalystApp);
      return sendJson(res, 200, { leaderboard: all.slice(0, 10) });
    }

    // ── ACTION: get_state ─────────────────────────────────────────────────────
    if (action === 'get_state') {
      if (!sessionId) {
        return sendJson(res, 400, { error: 'Missing sessionId.' });
      }
      const state = await loadSession(catalystApp, sessionId);
      if (!state) {
        return sendJson(res, 404, { error: 'Session not found or expired.' });
      }
      return sendJson(res, 200, { ...state, session_id: sessionId });
    }

    return sendJson(res, 400, { error: `Unknown action: "${action}". Valid actions: start, play, save_score, leaderboard, get_state` });

  } catch (err) {
    console.error('WordChain API error:', err);
    sendJson(res, 500, { error: 'Internal server error. Please try again.' });
  }
};
