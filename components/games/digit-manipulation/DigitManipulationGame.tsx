"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import AttemptsHearts from "@/components/games/AttemptsHearts";

type Operation = {
  type: string;
  operand?: number;
};

export default function DigitManipulationGame() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");

  // Round data
  const [currentRound, setCurrentRound] = useState<{ id: string; number: number } | null>(null);
  const [startingNumber, setStartingNumber] = useState("");
  const [operations, setOperations] = useState<Operation[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);

  // Game state flags
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isRoundFailed, setIsRoundFailed] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);

  // Submission result
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  async function fetchCurrentRound(afterCorrect = false) {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/games/current/round", { credentials: "include" });
      const json = await res.json();
      console.log("Digit Manipulation - Fetch Round:", json);

      if (!res.ok || !json.success) {
        if (afterCorrect) {
          setIsFinished(true);
        } else {
          setIsGameEnded(true);
        }
        setIsWaiting(false);
        setIsRoundFailed(false);
        return;
      }

      if (json.status === "FAILED") {
        setIsRoundFailed(true);
        setIsWaiting(false);
        setIsGameEnded(false);
        setCurrentRound(null);
        return;
      }

      if (json.status === "COMPLETED") {
        setIsFinished(true);
        setIsWaiting(false);
        setIsGameEnded(false);
        setIsRoundFailed(false);
        setCurrentRound(null);
        return;
      }

      if (json.status === "GAME_ENDED") {
        setIsGameEnded(true);
        setIsWaiting(false);
        setIsFinished(false);
        setIsRoundFailed(false);
        setCurrentRound(null);
        return;
      }

      if (!json.roundId) {
        setIsWaiting(true);
        setIsFinished(false);
        setIsGameEnded(false);
        setIsRoundFailed(false);
        setCurrentRound(null);
        return;
      }

      setIsWaiting(false);
      setIsGameEnded(false);
      setIsRoundFailed(false);
      setCurrentRound({ id: json.roundId, number: json.roundNumber ?? json.round });
      setStartingNumber(json.number);
      setOperations(json.operations ?? []);
      setAttemptsLeft(json.attemptsLeft ?? 3);
    } catch (err) {
      console.error("Round fetch error", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!currentRound || submitting || !answer.trim()) return;

    try {
      setSubmitting(true);
      setResult(null);

      const res = await fetch(`/api/v1/rounds/${currentRound.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
        credentials: "include",
      });

      const json = await res.json();
      console.log("Digit Manipulation - Submit:", json);

      const isCorrect =
        json.status === "CORRECT" ||
        json.status === "COMPLETED" ||
        json.correct === true;

      if (isCorrect) {
        setResult("correct");
        setAnswer("");

        if (json.status === "COMPLETED") {
          setIsFinished(true);
          return;
        }

        await fetchCurrentRound(true);
        setResult(null);
      } else {
        setResult("incorrect");
        if (json.attemptsLeft !== undefined) setAttemptsLeft(json.attemptsLeft);
        if (json.status === "FAILED") setIsRoundFailed(true);
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchCurrentRound();

    const channel = supabase
      .channel("realtime:games:digit-manipulation")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        () => { fetchCurrentRound(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function formatOperation(op: Operation): string {
    switch (op.type) {
      case "ADD": return `+ ${op.operand}`;
      case "SUBTRACT": return `- ${op.operand}`;
      case "MULTIPLY": return `× ${op.operand}`;
      case "DIVIDE": return `÷ ${op.operand}`;
      case "SHIFT_LEFT": return "SHIFT LEFT";
      case "SHIFT_RIGHT": return "SHIFT RIGHT";
      case "REVERSE": return "REVERSE";
      default: return op.type;
    }
  }

  function operationColor(type: string): string {
    switch (type) {
      case "ADD": return "var(--op-add)";
      case "SUBTRACT": return "var(--op-sub)";
      case "MULTIPLY": return "var(--op-mul)";
      case "DIVIDE": return "var(--op-div)";
      case "SHIFT_LEFT":
      case "SHIFT_RIGHT": return "var(--op-shift)";
      case "REVERSE": return "var(--op-rev)";
      default: return "var(--op-default)";
    }
  }

  // ── UI states ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="dm-page dm-page--center">
        <div className="dm-loader">
          <span>0</span><span>1</span><span>0</span><span>1</span>
        </div>
        <p className="dm-loader-text">Initializing puzzle…</p>
        <style>{dmStyles}</style>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="dm-page dm-page--center">
        <div className="dm-bg"><div className="dm-bg__grid" /><div className="dm-bg__glow dm-bg__glow--1" /><div className="dm-bg__glow dm-bg__glow--2" /></div>
        <div className="dm-status-icon dm-status-icon--waiting">⏳</div>
        <p className="dm-status-text">Waiting for admin to start digit manipulation…</p>
        <style>{dmStyles}</style>
      </div>
    );
  }

  if (isRoundFailed) {
    return (
      <div className="dm-page dm-page--center">
        <div className="dm-bg"><div className="dm-bg__grid" /><div className="dm-bg__glow dm-bg__glow--1" /><div className="dm-bg__glow dm-bg__glow--2" /></div>
        <div className="dm-status-icon dm-status-icon--failed">✗</div>
        <p className="dm-status-text dm-status-text--failed">Attempts exhausted — your run ends here.</p>
        <button onClick={() => router.push("/dashboard")} className="dm-nav-btn">
          proceed to dashboard →
        </button>
        <style>{dmStyles}</style>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="dm-page dm-page--center">
        <div className="dm-bg"><div className="dm-bg__grid" /><div className="dm-bg__glow dm-bg__glow--1" /><div className="dm-bg__glow dm-bg__glow--2" /></div>
        <div className="dm-status-icon dm-status-icon--success">✓</div>
        <p className="dm-status-text dm-status-text--success">All rounds cleared. Well played.</p>
        <button onClick={() => router.push("/dashboard")} className="dm-nav-btn dm-nav-btn--success">
          proceed to dashboard →
        </button>
        <style>{dmStyles}</style>
      </div>
    );
  }

  if (isGameEnded) {
    return (
      <div className="dm-page dm-page--center">
        <div className="dm-bg"><div className="dm-bg__grid" /><div className="dm-bg__glow dm-bg__glow--1" /><div className="dm-bg__glow dm-bg__glow--2" /></div>
        <div className="dm-status-icon dm-status-icon--ended">⊘</div>
        <p className="dm-status-text dm-status-text--ended">The Digit Manipulation has been ended by admin.</p>
        <button onClick={() => router.push("/dashboard")} className="dm-nav-btn">
          proceed to dashboard →
        </button>
        <style>{dmStyles}</style>
      </div>
    );
  }

  // ── Main game UI ───────────────────────────────────────────────────────────

  return (
    <div className="dm-page">
      {/* Ambient background */}
      <div className="dm-bg">
        <div className="dm-bg__grid" />
        <div className="dm-bg__glow dm-bg__glow--1" />
        <div className="dm-bg__glow dm-bg__glow--2" />
      </div>

      {/* Header */}
      <header className="dm-header">
        <div className="dm-header__left">
          <span className="dm-title dm-title--glitch" data-text="DIGIT">DIGIT</span>
          <span className="dm-title dm-title--thin">MANIPULATION</span>
        </div>
        <div className="dm-header__right">
          <span className="dm-round-badge">RND {currentRound?.number}</span>
          <AttemptsHearts remaining={attemptsLeft} />
        </div>
      </header>

      {/* Number Display */}
      <section className="dm-number-section">
        <p className="dm-label">YOUR NUMBER</p>
        <div className="dm-number">
          {startingNumber.split("").map((d, i) => (
            <span
              key={i}
              className={`dm-digit ${i % 2 === 0 ? "dm-digit--active" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* Operations */}
      <section className="dm-ops-section">
        <p className="dm-label">OPERATIONS — APPLY IN ORDER</p>
        <div className="dm-ops-list">
          {operations.map((op, i) => {
            const color = operationColor(op.type);
            return (
              <div
                key={i}
                className="dm-step"
                style={{
                  borderColor: `hsl(${color} / 0.19)`,
                  background: `hsl(${color} / 0.03)`,
                  animationDelay: `${i * 80 + 400}ms`,
                }}
              >
                <span className="dm-step__num" style={{ background: `hsl(${color} / 0.13)`, color: `hsl(${color})` }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="dm-step__text">{formatOperation(op)}</span>
                <span className="dm-step__tag" style={{ color: `hsl(${color} / 0.5)` }}>{op.type}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Answer Section */}
      <section className="dm-answer-section">
        <p className="dm-label">FINAL ANSWER</p>
        <div className={`dm-input-row ${result === "correct" ? "dm-input-row--correct" : result === "incorrect" ? "dm-input-row--wrong" : ""}`}>
          <input
            className="dm-input"
            type="text"
            inputMode="numeric"
            placeholder="Enter calculated result…"
            value={answer}
            disabled={submitting || attemptsLeft === 0}
            onChange={(e) => { setAnswer(e.target.value); setResult(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          />
          <button
            className="dm-submit"
            disabled={!answer.trim() || submitting || attemptsLeft === 0}
            onClick={handleSubmit}
          >
            {submitting ? <span className="dm-submit__spinner" /> : "SUBMIT"}
          </button>
        </div>

        {result === "correct" && (
          <p className="dm-feedback dm-feedback--correct">Correct — advancing to next round…</p>
        )}
        {result === "incorrect" && (
          <p className="dm-feedback dm-feedback--wrong">
            Wrong answer — {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
          </p>
        )}
      </section>

      <style>{dmStyles}</style>
    </div>
  );
}

// ── All styles ────────────────────────────────────────────────────────────────

const dmStyles = `
  .dm-page {
    --bg: hsl(var(--background));
    --surface: hsl(var(--card));
    --surface2: hsl(var(--muted));
    --dm-border: hsl(var(--border));
    --accent: hsl(var(--primary));
    --accent-dim: hsl(var(--primary) / 0.13);
    --accent-mid: hsl(var(--primary) / 0.4);
    --red: hsl(var(--destructive));
    --amber: hsl(var(--warning));
    --text: hsl(var(--foreground));
    --text-dim: hsl(var(--muted-foreground));

    /* Operation color tokens (raw HSL for opacity use) */
    --op-add: var(--success);
    --op-sub: var(--destructive);
    --op-mul: var(--warning);
    --op-div: 24 90% 53%;
    --op-shift: 235 80% 75%;
    --op-rev: var(--secondary);
    --op-default: var(--muted-foreground);

    position: relative;
    min-height: 100%;
    background: transparent;
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    padding: 24px 20px 32px;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 28px;
    flex: 1;
    border-radius: 12px;
  }

  .dm-page--center {
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  /* ── Ambient background ── */
  .dm-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; border-radius: 12px; }
  .dm-bg__grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--dm-border) 1px, transparent 1px),
      linear-gradient(90deg, var(--dm-border) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.12;
  }
  .dm-bg__glow {
    position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1;
  }
  .dm-bg__glow--1 {
    width: 400px; height: 400px; top: -100px; right: -60px;
    background: var(--accent);
  }
  .dm-bg__glow--2 {
    width: 300px; height: 300px; bottom: -80px; left: -40px;
    background: hsl(var(--secondary));
  }

  /* ── Loader ── */
  .dm-loader {
    display: flex; gap: 8px;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 36px; font-weight: 700; color: var(--accent);
  }
  .dm-loader span { animation: dm-blink 1s infinite alternate; }
  .dm-loader span:nth-child(2) { animation-delay: 0.15s; }
  .dm-loader span:nth-child(3) { animation-delay: 0.3s; }
  .dm-loader span:nth-child(4) { animation-delay: 0.45s; }
  @keyframes dm-blink { 0% { opacity: 0.15; } 100% { opacity: 1; } }
  .dm-loader-text {
    color: var(--text-dim); font-size: 12px;
    letter-spacing: 3px; text-transform: uppercase;
  }

  /* ── Status screens ── */
  .dm-status-icon {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; z-index: 1;
    animation: dm-fadeUp 0.5s ease both;
  }
  .dm-status-icon--waiting { background: hsl(var(--warning) / 0.08); border: 1px solid hsl(var(--warning) / 0.19); }
  .dm-status-icon--failed { background: hsl(var(--destructive) / 0.08); border: 1px solid hsl(var(--destructive) / 0.19); color: var(--red); }
  .dm-status-icon--success { background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.19); color: var(--accent); }
  .dm-status-icon--ended { background: hsl(var(--destructive) / 0.08); border: 1px solid hsl(var(--destructive) / 0.19); color: var(--red); }

  .dm-status-text {
    font-size: 13px; color: var(--text-dim); z-index: 1;
    letter-spacing: 1px; text-align: center;
    animation: dm-fadeUp 0.5s ease 0.1s both;
  }
  .dm-status-text--failed { color: var(--red); }
  .dm-status-text--success { color: var(--accent); }
  .dm-status-text--ended { color: var(--red); font-weight: 600; }

  .dm-nav-btn {
    z-index: 1; margin-top: 8px;
    padding: 10px 24px; border-radius: 8px;
    background: var(--surface2); border: 1px solid var(--dm-border);
    color: var(--text-dim); font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    animation: dm-fadeUp 0.5s ease 0.2s both;
  }
  .dm-nav-btn:hover { border-color: var(--accent-mid); color: var(--text); background: var(--surface); transform: translateY(-1px); }
  .dm-nav-btn:active { transform: scale(0.97); }
  .dm-nav-btn--success { border-color: var(--accent-mid); }
  .dm-nav-btn--success:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Header ── */
  .dm-header {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dm-header__left { display: flex; align-items: baseline; gap: 10px; }
  .dm-header__right { display: flex; align-items: center; gap: 14px; }

  .dm-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 24px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase; color: var(--accent);
  }
  .dm-title--thin {
    font-weight: 400; color: var(--text); font-size: 18px; letter-spacing: 5px;
  }
  .dm-title--glitch {
    position: relative; display: inline-block;
  }
  .dm-title--glitch::before,
  .dm-title--glitch::after {
    content: attr(data-text); position: absolute; left: 0; top: 0;
    overflow: hidden; clip-path: inset(0); opacity: 0.6;
    font-family: inherit; font-size: inherit; font-weight: inherit;
    letter-spacing: inherit; text-transform: inherit;
  }
  .dm-title--glitch::before {
    color: hsl(var(--primary)); animation: dm-glitch1 3s infinite linear alternate;
  }
  .dm-title--glitch::after {
    color: var(--red); animation: dm-glitch2 2.5s infinite linear alternate;
  }
  @keyframes dm-glitch1 {
    0%, 90% { clip-path: inset(0 0 95% 0); }
    5% { clip-path: inset(40% 0 20% 0); transform: translateX(-3px); }
    10% { clip-path: inset(70% 0 5% 0); transform: translateX(2px); }
    15%, 85% { clip-path: inset(0 0 100% 0); }
  }
  @keyframes dm-glitch2 {
    0%, 88% { clip-path: inset(95% 0 0 0); }
    8% { clip-path: inset(10% 0 60% 0); transform: translateX(3px); }
    12% { clip-path: inset(50% 0 10% 0); transform: translateX(-2px); }
    18%, 82% { clip-path: inset(100% 0 0 0); }
  }

  .dm-round-badge {
    padding: 4px 12px; border-radius: 6px;
    background: var(--surface2); border: 1px solid var(--dm-border);
    font-family: 'Orbitron', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 2px; color: var(--accent);
  }

  /* ── Labels ── */
  .dm-label {
    font-size: 10px; font-weight: 600; letter-spacing: 3px;
    color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase;
  }

  /* ── Number display ── */
  .dm-number-section { position: relative; z-index: 1; text-align: center; }
  .dm-number {
    display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;
  }
  .dm-digit {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 56px;
    background: var(--surface);
    border: 1px solid var(--dm-border);
    border-radius: 8px;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 24px; font-weight: 700; color: var(--text);
    animation: dm-fadeUp 0.5s ease both;
  }
  .dm-digit--active {
    border-color: var(--accent-mid);
    background: var(--accent-dim);
    color: var(--accent);
    box-shadow: 0 0 20px var(--accent-dim);
  }
  @keyframes dm-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Operations ── */
  .dm-ops-section { position: relative; z-index: 1; flex: 1; overflow-y: auto; }
  .dm-ops-list { display: flex; flex-direction: column; gap: 8px; }
  .dm-step {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    border: 1px solid var(--dm-border);
    border-radius: 10px;
    transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
    animation: dm-fadeUp 0.5s ease both;
  }
  .dm-step:hover { transform: translateX(4px); box-shadow: -4px 0 12px -4px var(--accent-dim); }
  .dm-step__num {
    flex-shrink: 0;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 700; font-size: 12px;
  }
  .dm-step__text {
    flex: 1; font-size: 14px; font-weight: 500; color: var(--text);
    letter-spacing: 1px;
  }
  .dm-step__tag {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  }

  /* ── Answer section ── */
  .dm-answer-section { position: relative; z-index: 1; }
  .dm-input-row {
    display: flex; gap: 8px;
    border: 1px solid var(--dm-border);
    border-radius: 10px;
    background: var(--surface);
    padding: 5px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .dm-input-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 24px var(--accent-dim);
  }
  .dm-input-row--correct { border-color: var(--accent); }
  .dm-input-row--wrong { border-color: var(--red); animation: dm-shake 0.4s; }
  @keyframes dm-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }

  .dm-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 16px; font-weight: 500;
    color: var(--text); padding: 10px 14px;
    letter-spacing: 2px;
  }
  .dm-input::placeholder { color: var(--text-dim); letter-spacing: 1px; font-size: 13px; }
  .dm-input:disabled { opacity: 0.4; }

  .dm-submit {
    flex-shrink: 0; padding: 10px 24px;
    background: var(--accent); color: var(--bg);
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 700; font-size: 13px;
    letter-spacing: 2px; text-transform: uppercase;
    border: none; border-radius: 7px; cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
    display: flex; align-items: center; justify-content: center;
    min-width: 100px;
  }
  .dm-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 0 16px var(--accent-dim); }
  .dm-submit:active:not(:disabled) { transform: scale(0.97); }
  .dm-submit:disabled { opacity: 0.3; cursor: not-allowed; }

  .dm-submit__spinner {
    display: block; width: 16px; height: 16px;
    border: 2px solid transparent; border-top-color: var(--bg);
    border-radius: 50%; animation: dm-spin 0.6s linear infinite;
  }
  @keyframes dm-spin { to { transform: rotate(360deg); } }

  /* ── Feedback ── */
  .dm-feedback {
    margin-top: 10px; font-size: 12px; font-weight: 600;
    letter-spacing: 1px; animation: dm-fadeUp 0.3s ease both;
  }
  .dm-feedback--wrong { color: var(--red); }
  .dm-feedback--correct { color: var(--accent); }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .dm-title { font-size: 18px; }
    .dm-title--thin { font-size: 14px; }
    .dm-digit { width: 36px; height: 44px; font-size: 18px; }
    .dm-header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .dm-header__right { align-self: flex-end; }
  }
`;
