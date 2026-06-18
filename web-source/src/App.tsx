import { useState, useRef, useEffect } from 'react';
import {
  startGame,
  playWord,
  timeoutTurn,
  saveScore,
  getLeaderboard,
  type GameState,
  type LeaderboardEntry
} from './api';

// ─── Sub-components ───────────────────────────────────────────────────────────

function LifeHearts({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1 text-2xl" aria-label={`${lives} lives remaining`}>
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={i < lives ? 'life-icon' : 'life-icon-lost'}>
          {i < lives ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}
function TimerDisplay({ timeLeft, totalSeconds }: { timeLeft: number | null; totalSeconds: number }) {
  if (timeLeft === null) return null;
  const pct = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const urgent = timeLeft <= 5;
  const color = pct > 0.5 ? 'text-green-400' : pct > 0.25 ? 'text-yellow-400' : 'text-red-400';
  const barColor = pct > 0.5 ? 'bg-green-400' : pct > 0.25 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
      urgent ? 'animate-pulse ring-2 ring-red-500 bg-red-950' : ''
    }`}>
      <div className={`text-2xl font-bold tabular-nums leading-none ${color}`}>
        {timeLeft}s
      </div>
      <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${Math.max(0, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}
function ChainWord({ word, isAI, isLatest }: { word: string; isAI: boolean; isLatest: boolean }) {
  return (
    <span
      className={`chain-word ${isAI ? 'chain-word-ai' : 'chain-word-player'} ${isLatest ? 'ring-2 ring-white ring-opacity-40' : ''}`}
    >
      {isAI ? '🤖' : '👤'} {word}
    </span>
  );
}

function ChainDisplay({ chain }: { chain: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chain.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {chain.length === 0 ? (
        <p className="text-gray-500 text-sm text-center mt-8">Chain will appear here…</p>
      ) : (
        <div className="flex flex-wrap gap-2 items-start content-start">
          {chain.map((word, idx) => (
            <ChainWord
              key={`${word}-${idx}`}
              word={word}
              isAI={idx % 2 === 0} // AI plays first (even indices)
              isLatest={idx === chain.length - 1}
            />
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function Leaderboard({
  entries,
  onClose
}: {
  entries: LeaderboardEntry[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">🏆 Leaderboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No scores yet. Be the first!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Player</th>
                <th className="pb-2 pr-2 text-right">Rounds</th>
                <th className="pb-2 text-right">Chain</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.ROWID ?? i} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-2 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-2 text-white font-medium">{e.PlayerName}</td>
                  <td className="py-2 pr-2 text-right text-violet-300">{e.Score}</td>
                  <td className="py-2 text-right text-cyan-300">{e.ChainLength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function GameOverModal({
  reason,
  chain,
  round,
  onSave,
  onNewGame,
  onShowLeaderboard
}: {
  reason: string;
  chain: string[];
  round: number;
  onSave: (name: string) => void;
  onNewGame: () => void;
  onShowLeaderboard: () => void;
}) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const isWin = reason.toLowerCase().includes('win') || reason.toLowerCase().includes('forfeit');

  function handleSave() {
    if (!name.trim()) return;
    setSaved(true);
    onSave(name.trim());
    onShowLeaderboard();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm animate-bounce-in text-center">
        <div className="text-5xl mb-4">{isWin ? '🎉' : '💀'}</div>
        <h2 className={`text-2xl font-bold mb-2 ${isWin ? 'text-yellow-400' : 'text-red-400'}`}>
          {isWin ? 'You Win!' : 'Game Over'}
        </h2>
        <p className="text-gray-300 mb-4">{reason}</p>
        <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
          <div className="text-sm text-gray-400 mb-1">Final Stats</div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Rounds survived</span>
            <span className="text-violet-300 font-bold">{round}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-300">Words in chain</span>
            <span className="text-cyan-300 font-bold">{chain.length}</span>
          </div>
        </div>

        {!saved ? (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your name to save score"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 mb-2"
            />
            <button
              disabled={!name.trim()}
              onClick={handleSave}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 font-medium transition-colors"
            >
              Save Score
            </button>
          </div>
        ) : null}

        <button
          onClick={onNewGame}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 font-medium transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type Screen = 'menu' | 'playing' | 'gameover';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'error' | 'info' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(60);

  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const timedOutRef = useRef(false);

  // Keep sessionIdRef in sync so the timer effect can access it without stale closure
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Countdown timer — runs whenever deadline or screen changes
  useEffect(() => {
    if (!deadline || screen !== 'playing') {
      setTimeLeft(null);
      return;
    }
    timedOutRef.current = false;

    const tick = () => {
      const ms = deadline - Date.now();
      const secs = Math.ceil(ms / 1000);
      if (secs <= 0) {
        setTimeLeft(0);
        if (!timedOutRef.current) {
          timedOutRef.current = true;
          const sid = sessionIdRef.current;
          if (sid) {
            timeoutTurn(sid)
              .then((state) => {
                setGameState(state);
                if (state.game_over) {
                  setScreen('gameover');
                  setDeadline(null);
                } else {
                  setFeedback({ msg: "\u23f1 Time's up! You lost a life.", type: 'error' });
                  setShakeInput(true);
                  setTimeout(() => setShakeInput(false), 500);
                  if (state.round_deadline) {
                    setTotalSeconds(state.timeout_seconds ?? 60);
                    setDeadline(state.round_deadline);
                  }
                }
              })
              .catch(console.error);
          }
        }
      } else {
        setTimeLeft(secs);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline, screen]);

  useEffect(() => {
    if (screen === 'playing' && !loading) {
      inputRef.current?.focus();
    }
  }, [screen, loading, gameState]);

  async function handleStart() {
    setLoading(true);
    setFeedback(null);
    setLeaderboard(null);
    try {
      const state = await startGame();
      setGameState(state);
      setSessionId(state.session_id ?? null);
      setTotalSeconds(state.timeout_seconds ?? 60);
      setDeadline(state.round_deadline ?? null);
      setScreen('playing');
      setInput('');
      setScoreSaved(false);
    } catch (err) {
      setFeedback({ msg: `Failed to start game: ${(err as Error).message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!input.trim() || loading || !sessionId || !gameState) return;

    // Cancel any pending timeout
    timedOutRef.current = true;
    setDeadline(null);

    setLoading(true);
    setFeedback(null);
    const word = input.trim();
    setInput('');

    try {
      const state = await playWord(sessionId, word);
      setGameState(state);

      if (!state.valid) {
        setFeedback({ msg: state.reason ?? 'Invalid word.', type: 'error' });
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      } else if (state.ai_word) {
        setFeedback({ msg: `AI played: ${state.ai_word}`, type: 'info' });
      }

      if (state.game_over) {
        setScreen('gameover');
        setDeadline(null);
      } else if (state.round_deadline) {
        setTotalSeconds(state.timeout_seconds ?? 60);
        setDeadline(state.round_deadline);
      }
    } catch (err) {
      setFeedback({ msg: `Error: ${(err as Error).message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScore(name: string) {
    if (scoreSaved) return;
    setScoreSaved(true);
    try {
      await saveScore(
        sessionId ?? '',
        name,
        gameState?.round ?? 1,
        gameState?.chain?.length ?? 1
      );
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  }

  async function handleShowLeaderboard() {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      setFeedback({ msg: `Failed to load leaderboard: ${(err as Error).message}`, type: 'error' });
    }
  }

  // ── Menu Screen ─────────────────────────────────────────────────────────────
  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-600 shadow-lg shadow-violet-900">
            <span className="text-3xl font-black tracking-tighter text-violet-100" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-2px' }}>WC</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            WordChain
          </h1>
          <p className="text-gray-400 text-lg">Chain words. Beat the AI. Survive.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full text-sm text-gray-300 space-y-3">
          <div className="font-bold text-white text-base mb-2">How to play</div>
          <div className="flex gap-3">
            <span className="text-violet-400">①</span>
            <span>Each word must <strong>start with the last letter</strong> of the previous word.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-violet-400">②</span>
            <span>Only real English words — <strong>no proper nouns</strong>, min 3 letters.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-violet-400">③</span>
            <span>No word can be <strong>repeated</strong> once used.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-red-400">♥</span>
            <span>You start with <strong>3 lives</strong>. An invalid word costs one life.</span>
          </div>
          <div className="flex gap-3">
            <span className="text-cyan-400">🤖</span>
            <span>The AI <strong>prefers words ending in X, Q, Z, U</strong> to trap you!</span>
          </div>
        </div>

        {feedback && (
          <p className="text-red-400 text-sm">{feedback.msg}</p>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl py-4 text-lg font-bold transition-all duration-200 shadow-lg shadow-violet-900 hover:shadow-violet-800 animate-pulse-glow"
          >
            {loading ? 'Starting…' : '▶ Start Game'}
          </button>
          <button
            onClick={handleShowLeaderboard}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl py-3 text-sm font-medium transition-colors"
          >
            🏆 Leaderboard
          </button>
        </div>

        {leaderboard !== null && (
          <Leaderboard entries={leaderboard} onClose={() => setLeaderboard(null)} />
        )}
      </div>
    );
  }

  // ── Playing Screen ──────────────────────────────────────────────────────────
  if (screen === 'playing' && gameState) {
    return (
      <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Round <span className="text-white font-bold">{gameState.round}</span></span>
            <LifeHearts lives={gameState.lives} />
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Next starts with</div>
            <div className="text-3xl font-bold text-violet-400">{gameState.next_letter}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TimerDisplay timeLeft={timeLeft} totalSeconds={totalSeconds} />
            <button
              onClick={() => { setScreen('menu'); setDeadline(null); }}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
              title="Quit game"
            >
              ✕ Quit
            </button>
          </div>
        </div>

        {/* Chain */}
        <ChainDisplay chain={gameState.chain} />

        {/* Feedback */}
        {feedback && (
          <div
            className={`mx-4 mb-2 px-4 py-2 rounded-lg text-sm animate-fade-in ${
              feedback.type === 'error'
                ? 'bg-red-900 border border-red-700 text-red-200'
                : feedback.type === 'success'
                ? 'bg-green-900 border border-green-700 text-green-200'
                : 'bg-cyan-900 border border-cyan-700 text-cyan-200'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Input */}
        <div className={`px-4 pb-6 pt-2 flex gap-2 ${shakeInput ? 'animate-shake' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder={`Type a word starting with ${gameState.next_letter}…`}
            disabled={loading}
            maxLength={30}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 text-base uppercase tracking-widest"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 font-bold text-lg transition-colors"
          >
            {loading ? '…' : '→'}
          </button>
        </div>
      </div>
    );
  }

  // ── Game Over Screen ────────────────────────────────────────────────────────
  if (screen === 'gameover' && gameState) {
    return (
      <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <span className="text-gray-400 text-sm">Final Round: <span className="text-white font-bold">{gameState.round}</span></span>
          <LifeHearts lives={gameState.lives} />
        </div>
        <ChainDisplay chain={gameState.chain} />
        <GameOverModal
          reason={gameState.game_over_reason ?? 'Game over.'}
          chain={gameState.chain}
          round={gameState.round}
          onSave={handleSaveScore}
          onShowLeaderboard={handleShowLeaderboard}
          onNewGame={handleStart}
        />
        {leaderboard !== null && (
          <Leaderboard entries={leaderboard} onClose={() => setLeaderboard(null)} />
        )}
      </div>
    );
  }

  return null;
}
