"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import AttemptsHearts from "@/components/games/AttemptsHearts";
import { getGameScreen } from "@/lib/gameMessages";
import type { MessageCode } from "@/lib/types/teamGameState";

export default function QuizGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");

  // Round data
  const [currentRound, setCurrentRound] = useState<{ id: string; number: number } | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(2);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);

  // Game state flags
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [isFinalPhase, setIsFinalPhase] = useState(false);

  // Submission result
  const [result, setResult] = useState<"correct" | "incorrect" | "round_failed" | null>(null);

  // Final phase
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalAttemptsLeft, setFinalAttemptsLeft] = useState(2);
  const [finalResult, setFinalResult] = useState<"correct" | "incorrect" | null>(null);
  const [finalSubmitting, setFinalSubmitting] = useState(false);

  // Fail Sound Effect
  const failSoundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    failSoundRef.current = new Audio("/sounds/faaaa.mp3");
  }, []);
  function playFail() {
    failSoundRef.current?.pause();
    failSoundRef.current!.currentTime = 0;
    failSoundRef.current?.play();
  }

  function appendRevealedNumber(asciiNumber: unknown) {
    if (typeof asciiNumber !== "number" || Number.isNaN(asciiNumber)) return;

    setRevealedNumbers((prev) => (
      prev.includes(asciiNumber) ? prev : [...prev, asciiNumber]
    ));
  }

  function syncRevealedNumbers(nextNumbers: unknown) {
    if (!Array.isArray(nextNumbers)) return;

    const normalized = nextNumbers.filter(
      (value): value is number => typeof value === "number" && !Number.isNaN(value)
    );

    setRevealedNumbers((prev) => {
      if (normalized.length === 0) return prev;
      return normalized;
    });
  }

  async function fetchCurrentRound() {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/games/current/round", {
        credentials: "include",
      });
      const json = res.ok ? await res.json() : null;
      console.log("Quiz V2 - Fetch Round:", json);

      const screen = getGameScreen(json?.messageCode as MessageCode | undefined);

      setIsFinished(screen === "finished");
      setIsGameEnded(screen === "time_over");
      setIsWaiting(screen === "waiting");
      setIsFinalPhase(screen === "rounds_done");

      if (screen === "rounds_done") {
        syncRevealedNumbers(json?.revealedNumbers);
        setCurrentRound(null);
        return;
      }

      if (screen !== "playing") {
        setCurrentRound(null);
        return;
      }

      if (!json.roundId) {
        setIsWaiting(true);
        setCurrentRound(null);
        return;
      }

      // ACTIVE round
      setCurrentRound({ id: json.roundId, number: json.round });
      setQuestion(json.question);
      setOptions(json.options ?? []);
      setAttemptsLeft(json.attemptsLeft ?? 2);
      syncRevealedNumbers(json.revealedNumbers);
      setSelectedOption(null);
      setResult(null);
    } catch (err) {
      console.error("Round fetch error", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!currentRound || submitting || !selectedOption) return;

    try {
      setSubmitting(true);
      setResult(null);

      const res = await fetch(`/api/v1/rounds/${currentRound.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selectedOption }),
        credentials: "include",
      });

      const json = await res.json();
      console.log("Quiz V2 - Submit:", json);

      if (json.status === "CORRECT") {
        setResult("correct");
        appendRevealedNumber(json.asciiNumber);
        setSelectedOption(null);
        setTimeout(async () => {
          await fetchCurrentRound();
          setResult(null);
        }, 1200);
        return;
      }

      if (json.status === "ALL_ROUNDS_COMPLETED") {
        setResult("correct");
        appendRevealedNumber(json.asciiNumber);
        syncRevealedNumbers(json.revealedNumbers);
        setTimeout(() => {
          setIsFinalPhase(true);
          setCurrentRound(null);
          setResult(null);
        }, 1500);
        return;
      }

      if (json.status === "ROUND_FAILED") {
        setResult("round_failed");
        playFail();
        setTimeout(async () => {
          await fetchCurrentRound();
          setResult(null);
        }, 1800);
        return;
      }

      if (json.status === "INCORRECT") {
        setResult("incorrect");
        if (json.attemptsLeft !== undefined) setAttemptsLeft(json.attemptsLeft);
        playFail();
        return;
      }

      // FAILED (no attempts remaining - rejected)
      if (json.status === "FAILED") {
        setResult("incorrect");
        playFail();
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitFinalAnswer() {
    if (!gameId || finalSubmitting || !finalAnswer.trim()) return;

    try {
      setFinalSubmitting(true);
      setFinalResult(null);

      const res = await fetch(`/api/v1/games/${gameId}/final-submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: finalAnswer.trim() }),
        credentials: "include",
      });

      const json = await res.json();
      console.log("Quiz V2 - Final Submit:", json);

      if (json.status === "CORRECT" || json.status === "ALREADY_COMPLETED") {
        setFinalResult("correct");
        setTimeout(() => setIsFinished(true), 1500);
        return;
      }

      if (json.status === "INCORRECT") {
        setFinalResult("incorrect");
        setFinalAttemptsLeft(json.attemptsLeft ?? 0);
        playFail();

        if (json.gameCompleted || json.attemptsLeft === 0) {
          setTimeout(() => setIsFinished(true), 2000);
        }
        return;
      }

      if (json.status === "ATTEMPTS_EXHAUSTED") {
        setFinalAttemptsLeft(0);
        setFinalResult("incorrect");
        setTimeout(() => setIsFinished(true), 2000);
      }
    } catch (err) {
      console.error("Final submit error", err);
    } finally {
      setFinalSubmitting(false);
    }
  }

  // Supabase Realtime subscription
  useEffect(() => {
    fetchCurrentRound();

    const channel = supabase
      .channel("realtime:games:quiz-v2")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        () => { fetchCurrentRound(); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams" },
        () => { fetchCurrentRound(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_round_progress" },
        () => { fetchCurrentRound(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── UI States ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="qz-page qz-page--center">
        <div className="qz-loader">
          <span>?</span><span>?</span><span>?</span><span>?</span>
        </div>
        <p className="qz-loader-text">Loading quiz...</p>
        <style>{qzStyles}</style>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="qz-page qz-page--center">
        <div className="qz-bg"><div className="qz-bg__grid" /><div className="qz-bg__glow qz-bg__glow--1" /><div className="qz-bg__glow qz-bg__glow--2" /></div>
        <div className="qz-status-icon qz-status-icon--waiting">&#x23F3;</div>
        <p className="qz-status-text">Waiting for admin to start the quiz...</p>
        <style>{qzStyles}</style>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="qz-page qz-page--center">
        <div className="qz-bg"><div className="qz-bg__grid" /><div className="qz-bg__glow qz-bg__glow--1" /><div className="qz-bg__glow qz-bg__glow--2" /></div>
        <div className="qz-status-icon qz-status-icon--success">&#x2713;</div>
        <p className="qz-status-text qz-status-text--success">Quiz completed. Well played.</p>
        <button onClick={() => router.push("/dashboard")} className="qz-nav-btn qz-nav-btn--success">
          proceed to dashboard &rarr;
        </button>
        <style>{qzStyles}</style>
      </div>
    );
  }

  if (isGameEnded) {
    return (
      <div className="qz-page qz-page--center">
        <div className="qz-bg"><div className="qz-bg__grid" /><div className="qz-bg__glow qz-bg__glow--1" /><div className="qz-bg__glow qz-bg__glow--2" /></div>
        <div className="qz-status-icon qz-status-icon--ended">&#x2298;</div>
        <p className="qz-status-text qz-status-text--ended">The Quiz has been ended by admin.</p>
        <button onClick={() => router.push("/dashboard")} className="qz-nav-btn">
          proceed to dashboard &rarr;
        </button>
        <style>{qzStyles}</style>
      </div>
    );
  }

  // ── Final Phase UI ──────────────────────────────────────────────────────────

  if (isFinalPhase) {
    return (
      <div className="qz-page">
        <div className="qz-bg"><div className="qz-bg__grid" /><div className="qz-bg__glow qz-bg__glow--1" /><div className="qz-bg__glow qz-bg__glow--2" /></div>

        <header className="qz-header">
          <div className="qz-header__left">
            <span className="qz-title qz-title--glitch" data-text="DECODE">DECODE</span>
            <span className="qz-title qz-title--thin">THE WORD</span>
          </div>
          <div className="qz-header__right">
            <AttemptsHearts total={2} remaining={finalAttemptsLeft} />
          </div>
        </header>

        {/* Revealed ASCII Numbers */}
        <section className="qz-revealed-section">
          <p className="qz-label">REVEALED ASCII NUMBERS</p>
          <div className="qz-revealed-numbers">
            {revealedNumbers.map((num, i) => (
              <div
                key={i}
                className="qz-ascii-card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="qz-ascii-card__num">{num}</span>
              </div>
            ))}
          </div>
          {revealedNumbers.length === 0 && (
            <p className="qz-hint">No numbers were revealed.</p>
          )}
        </section>

        {/* Hint */}
        <section className="qz-hint-section">
          <p className="qz-hint">
            Uppercase ASCII codes (65-90) are real letters. Lowercase codes (97-122) are noise.
            Decode the hidden word from the uppercase letters.
          </p>
        </section>

        {/* Final Answer Input */}
        <section className="qz-answer-section">
          <p className="qz-label">YOUR ANSWER</p>
          <div className={`qz-input-row ${finalResult === "correct" ? "qz-input-row--correct" : finalResult === "incorrect" ? "qz-input-row--wrong" : ""}`}>
            <input
              className="qz-input"
              type="text"
              placeholder="Enter the decoded word..."
              value={finalAnswer}
              disabled={finalSubmitting || finalAttemptsLeft === 0}
              onChange={(e) => { setFinalAnswer(e.target.value); setFinalResult(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmitFinalAnswer(); }}
            />
            <button
              className="qz-submit"
              disabled={!finalAnswer.trim() || finalSubmitting || finalAttemptsLeft === 0}
              onClick={handleSubmitFinalAnswer}
            >
              {finalSubmitting ? <span className="qz-submit__spinner" /> : "SUBMIT"}
            </button>
          </div>

          {finalResult === "correct" && (
            <p className="qz-feedback qz-feedback--correct">Correct! Word decoded successfully.</p>
          )}
          {finalResult === "incorrect" && (
            <p className="qz-feedback qz-feedback--wrong">
              Wrong answer{finalAttemptsLeft > 0 ? ` \u2014 ${finalAttemptsLeft} attempt${finalAttemptsLeft !== 1 ? "s" : ""} remaining` : " \u2014 no attempts remaining"}
            </p>
          )}
        </section>

        <style>{qzStyles}</style>
      </div>
    );
  }

  // ── Main Game UI (Active Round) ─────────────────────────────────────────────

  return (
    <div className="qz-page">
      <div className="qz-bg">
        <div className="qz-bg__grid" />
        <div className="qz-bg__glow qz-bg__glow--1" />
        <div className="qz-bg__glow qz-bg__glow--2" />
      </div>

      {/* Header */}
      <header className="qz-header">
        <div className="qz-header__left">
          <span className="qz-title qz-title--glitch" data-text="QUIZ">QUIZ</span>
        </div>
        <div className="qz-header__right">
          <span className="qz-round-badge">RND {currentRound?.number}/10</span>
          <AttemptsHearts total={2} remaining={attemptsLeft} />
        </div>
      </header>

      {/* Round Progress */}
      <section className="qz-progress-section">
        <div className="qz-progress-dots">
          {Array.from({ length: 10 }, (_, i) => {
            const roundNum = i + 1;
            const isActive = roundNum === currentRound?.number;
            const isCompleted = roundNum < (currentRound?.number ?? 1);
            return (
              <div
                key={i}
                className={`qz-progress-dot ${isActive ? "qz-progress-dot--active" : isCompleted ? "qz-progress-dot--done" : "qz-progress-dot--locked"}`}
              >
                {roundNum}
              </div>
            );
          })}
        </div>
      </section>

      {/* Revealed Numbers Strip */}
      {revealedNumbers.length > 0 && (
        <section className="qz-revealed-strip">
          <p className="qz-label">REVEALED CODES</p>
          <div className="qz-revealed-numbers qz-revealed-numbers--compact">
            {revealedNumbers.map((num, i) => (
              <span key={i} className="qz-code-chip" style={{ animationDelay: `${i * 60}ms`, color: "#ffffff", fontSize: "18px" }}>
                {String(num)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Question */}
      <section className="qz-question-section">
        <p className="qz-label">QUESTION</p>
        <div className="qz-question-card">
          <p className="qz-question-text">{question}</p>
        </div>
      </section>

      {/* Options Grid */}
      <section className="qz-options-section">
        <p className="qz-label">SELECT YOUR ANSWER</p>
        <div className="qz-options-grid">
          {options.map((opt, i) => (
            <button
              key={i}
              className={`qz-option ${selectedOption === opt ? "qz-option--selected" : ""} ${result === "correct" && selectedOption === opt ? "qz-option--correct" : ""} ${result === "incorrect" && selectedOption === opt ? "qz-option--wrong" : ""}`}
              disabled={submitting || result === "correct" || result === "round_failed"}
              onClick={() => { setSelectedOption(opt); setResult(null); }}
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <span className="qz-option__label">{String.fromCharCode(65 + i)}</span>
              <span className="qz-option__text">{opt}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Submit */}
      <section className="qz-submit-section">
        <button
          className="qz-submit qz-submit--full"
          disabled={!selectedOption || submitting || result === "correct" || result === "round_failed"}
          onClick={handleSubmitAnswer}
        >
          {submitting ? <span className="qz-submit__spinner" /> : "SUBMIT ANSWER"}
        </button>

        {result === "correct" && (
          <p className="qz-feedback qz-feedback--correct">Correct! Advancing to next round...</p>
        )}
        {result === "incorrect" && (
          <p className="qz-feedback qz-feedback--wrong">
            Wrong answer &mdash; {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
          </p>
        )}
        {result === "round_failed" && (
          <p className="qz-feedback qz-feedback--failed">
            Attempts exhausted &mdash; advancing to next round...
          </p>
        )}
      </section>

      <style>{qzStyles}</style>
    </div>
  );
}

// ── All styles ────────────────────────────────────────────────────────────────

const qzStyles = `
  .qz-page {
    --bg: hsl(var(--background));
    --surface: hsl(var(--card));
    --surface2: hsl(var(--muted));
    --qz-border: hsl(var(--border));
    --accent: hsl(var(--primary));
    --accent-dim: hsl(var(--primary) / 0.13);
    --accent-mid: hsl(var(--primary) / 0.4);
    --red: hsl(var(--destructive));
    --amber: hsl(var(--warning));
    --text: hsl(var(--foreground));
    --text-dim: hsl(var(--muted-foreground));

    position: relative;
    height: 100%;
    max-height: 100vh;
    background: transparent;
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    padding: 24px 20px 32px;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    border-radius: 12px;
  }

  .qz-page--center {
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  /* ── Ambient background ── */
  .qz-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; border-radius: 12px; }
  .qz-bg__grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--qz-border) 1px, transparent 1px),
      linear-gradient(90deg, var(--qz-border) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.12;
  }
  .qz-bg__glow {
    position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1;
  }
  .qz-bg__glow--1 {
    width: 400px; height: 400px; top: -100px; right: -60px;
    background: var(--accent);
  }
  .qz-bg__glow--2 {
    width: 300px; height: 300px; bottom: -80px; left: -40px;
    background: hsl(var(--secondary));
  }

  /* ── Loader ── */
  .qz-loader {
    display: flex; gap: 8px;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 36px; font-weight: 700; color: var(--accent);
  }
  .qz-loader span { animation: qz-blink 1s infinite alternate; }
  .qz-loader span:nth-child(2) { animation-delay: 0.15s; }
  .qz-loader span:nth-child(3) { animation-delay: 0.3s; }
  .qz-loader span:nth-child(4) { animation-delay: 0.45s; }
  @keyframes qz-blink { 0% { opacity: 0.15; } 100% { opacity: 1; } }
  .qz-loader-text {
    color: var(--text-dim); font-size: 12px;
    letter-spacing: 3px; text-transform: uppercase;
  }

  /* ── Status screens ── */
  .qz-status-icon {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; z-index: 1;
    animation: qz-fadeUp 0.5s ease both;
  }
  .qz-status-icon--waiting { background: hsl(var(--warning) / 0.08); border: 1px solid hsl(var(--warning) / 0.19); }
  .qz-status-icon--success { background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.19); color: var(--accent); }
  .qz-status-icon--ended { background: hsl(var(--destructive) / 0.08); border: 1px solid hsl(var(--destructive) / 0.19); color: var(--red); }

  .qz-status-text {
    font-size: 13px; color: var(--text-dim); z-index: 1;
    letter-spacing: 1px; text-align: center;
    animation: qz-fadeUp 0.5s ease 0.1s both;
  }
  .qz-status-text--success { color: var(--accent); }
  .qz-status-text--ended { color: var(--red); font-weight: 600; }

  .qz-nav-btn {
    z-index: 1; margin-top: 8px;
    padding: 10px 24px; border-radius: 8px;
    background: var(--surface2); border: 1px solid var(--qz-border);
    color: var(--text-dim); font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    animation: qz-fadeUp 0.5s ease 0.2s both;
  }
  .qz-nav-btn:hover { border-color: var(--accent-mid); color: var(--text); background: var(--surface); transform: translateY(-1px); }
  .qz-nav-btn:active { transform: scale(0.97); }
  .qz-nav-btn--success { border-color: var(--accent-mid); }
  .qz-nav-btn--success:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Header ── */
  .qz-header {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: space-between;
  }
  .qz-header__left { display: flex; align-items: baseline; gap: 10px; }
  .qz-header__right { display: flex; align-items: center; gap: 14px; }

  .qz-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 24px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase; color: var(--accent);
  }
  .qz-title--thin {
    font-weight: 400; color: var(--text); font-size: 18px; letter-spacing: 5px;
  }
  .qz-title--glitch {
    position: relative; display: inline-block;
  }
  .qz-title--glitch::before,
  .qz-title--glitch::after {
    content: attr(data-text); position: absolute; left: 0; top: 0;
    overflow: hidden; clip-path: inset(0); opacity: 0.6;
    font-family: inherit; font-size: inherit; font-weight: inherit;
    letter-spacing: inherit; text-transform: inherit;
  }
  .qz-title--glitch::before {
    color: hsl(var(--primary)); animation: qz-glitch1 3s infinite linear alternate;
  }
  .qz-title--glitch::after {
    color: var(--red); animation: qz-glitch2 2.5s infinite linear alternate;
  }
  @keyframes qz-glitch1 {
    0%, 90% { clip-path: inset(0 0 95% 0); }
    5% { clip-path: inset(40% 0 20% 0); transform: translateX(-3px); }
    10% { clip-path: inset(70% 0 5% 0); transform: translateX(2px); }
    15%, 85% { clip-path: inset(0 0 100% 0); }
  }
  @keyframes qz-glitch2 {
    0%, 88% { clip-path: inset(95% 0 0 0); }
    8% { clip-path: inset(10% 0 60% 0); transform: translateX(3px); }
    12% { clip-path: inset(50% 0 10% 0); transform: translateX(-2px); }
    18%, 82% { clip-path: inset(100% 0 0 0); }
  }

  .qz-round-badge {
    padding: 4px 12px; border-radius: 6px;
    background: var(--surface2); border: 1px solid var(--qz-border);
    font-family: 'Orbitron', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 2px; color: var(--accent);
  }

  /* ── Labels ── */
  .qz-label {
    font-size: 10px; font-weight: 600; letter-spacing: 3px;
    color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase;
  }

  /* ── Progress dots ── */
  .qz-progress-section { position: relative; z-index: 1; }
  .qz-progress-dots {
    display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;
  }
  .qz-progress-dot {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    font-family: 'Chakra Petch', sans-serif;
    font-size: 11px; font-weight: 700;
    border: 1px solid var(--qz-border);
    background: var(--surface);
    color: var(--text-dim);
    transition: all 0.3s ease;
  }
  .qz-progress-dot--active {
    border-color: var(--accent);
    background: var(--accent-dim);
    color: var(--accent);
    box-shadow: 0 0 12px var(--accent-dim);
    animation: qz-pulse 2s ease infinite;
  }
  .qz-progress-dot--done {
    border-color: hsl(var(--success) / 0.4);
    background: hsl(var(--success) / 0.08);
    color: hsl(var(--success));
  }
  .qz-progress-dot--locked {
    opacity: 0.4;
  }
  @keyframes qz-pulse {
    0%, 100% { box-shadow: 0 0 12px var(--accent-dim); }
    50% { box-shadow: 0 0 24px var(--accent-dim); }
  }

  /* ── Revealed numbers strip ── */
  .qz-revealed-strip { position: relative; z-index: 1; }
  .qz-revealed-numbers {
    display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  }
  .qz-revealed-numbers--compact { gap: 6px; }
  .qz-code-chip {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 48px; min-height: 36px; padding: 8px 14px; border-radius: 8px;
    background: hsl(var(--success) / 0.18);
    border: 1px solid hsl(var(--success) / 0.5);
    font-family: 'Chakra Petch', 'IBM Plex Mono', monospace;
    font-size: 18px !important; font-weight: 700;
    color: #ffffff !important;
    animation: qz-fadeUp 0.4s ease both;
  }

  /* ── ASCII cards (final phase) ── */
  .qz-revealed-section { position: relative; z-index: 1; text-align: center; }
  .qz-ascii-card {
    display: inline-flex; flex-direction: column; align-items: center;
    gap: 4px; padding: 12px 16px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--qz-border);
    animation: qz-fadeUp 0.5s ease both;
    min-width: 56px;
  }
  .qz-ascii-card--upper {
    border-color: var(--accent-mid);
    background: var(--accent-dim);
  }
  .qz-ascii-card--lower {
    opacity: 0.5;
  }
  .qz-ascii-card__num {
    font-family: 'Chakra Petch', sans-serif;
    font-size: 20px; font-weight: 700; color: var(--accent);
  }
  .qz-ascii-card__char {
    font-size: 12px; font-weight: 600;
    color: #ffffff; text-transform: none;
    letter-spacing: 1px;
  }

  /* ── Hint ── */
  .qz-hint-section { position: relative; z-index: 1; text-align: center; }
  .qz-hint {
    font-size: 12px; color: var(--text-dim);
    letter-spacing: 0.5px; line-height: 1.6;
    max-width: 500px; margin: 0 auto;
  }

  /* ── Question ── */
  .qz-question-section { position: relative; z-index: 1; flex: 0; }
  .qz-question-card {
    padding: 20px 24px;
    background: var(--surface);
    border: 1px solid var(--qz-border);
    border-radius: 12px;
    animation: qz-fadeUp 0.5s ease both;
  }
  .qz-question-text {
    font-size: 16px; font-weight: 500;
    color: var(--text); line-height: 1.6;
    letter-spacing: 0.3px;
  }

  /* ── Options grid ── */
  .qz-options-section { position: relative; z-index: 1; flex: 1; min-height: 0; }
  .qz-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .qz-option {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--qz-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    animation: qz-fadeUp 0.5s ease both;
    text-align: left;
    font-family: 'IBM Plex Mono', monospace;
    color: var(--text);
  }
  .qz-option:hover:not(:disabled) {
    border-color: var(--accent-mid);
    background: var(--accent-dim);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--accent-dim);
  }
  .qz-option:active:not(:disabled) { transform: scale(0.98); }
  .qz-option:disabled { cursor: not-allowed; opacity: 0.5; }
  .qz-option--selected {
    border-color: var(--accent) !important;
    background: var(--accent-dim) !important;
    box-shadow: 0 0 20px var(--accent-dim);
  }
  .qz-option--correct {
    border-color: hsl(var(--success)) !important;
    background: hsl(var(--success) / 0.1) !important;
    box-shadow: 0 0 20px hsl(var(--success) / 0.15);
  }
  .qz-option--wrong {
    border-color: var(--red) !important;
    background: hsl(var(--destructive) / 0.08) !important;
    animation: qz-shake 0.4s !important;
  }

  .qz-option__label {
    flex-shrink: 0;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    background: var(--surface2);
    font-family: 'Chakra Petch', sans-serif;
    font-weight: 700; font-size: 12px;
    color: var(--accent);
    border: 1px solid var(--qz-border);
  }
  .qz-option--selected .qz-option__label {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }
  .qz-option__text {
    font-size: 14px; font-weight: 500;
    line-height: 1.4;
  }

  /* ── Submit button ── */
  .qz-submit-section { position: relative; z-index: 1; }
  .qz-submit {
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
  .qz-submit--full { width: 100%; padding: 14px; font-size: 14px; border-radius: 10px; }
  .qz-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 0 16px var(--accent-dim); }
  .qz-submit:active:not(:disabled) { transform: scale(0.97); }
  .qz-submit:disabled { opacity: 0.3; cursor: not-allowed; }

  .qz-submit__spinner {
    display: block; width: 16px; height: 16px;
    border: 2px solid transparent; border-top-color: var(--bg);
    border-radius: 50%; animation: qz-spin 0.6s linear infinite;
  }
  @keyframes qz-spin { to { transform: rotate(360deg); } }

  /* ── Answer section (final phase) ── */
  .qz-answer-section { position: relative; z-index: 1; }
  .qz-input-row {
    display: flex; gap: 8px;
    border: 1px solid var(--qz-border);
    border-radius: 10px;
    background: var(--surface);
    padding: 5px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .qz-input-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 24px var(--accent-dim);
  }
  .qz-input-row--correct { border-color: var(--accent); }
  .qz-input-row--wrong { border-color: var(--red); animation: qz-shake 0.4s; }

  .qz-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 16px; font-weight: 500;
    color: var(--text); padding: 10px 14px;
    letter-spacing: 2px;
  }
  .qz-input::placeholder { color: var(--text-dim); letter-spacing: 1px; font-size: 13px; }
  .qz-input:disabled { opacity: 0.4; }

  /* ── Feedback ── */
  .qz-feedback {
    margin-top: 10px; font-size: 12px; font-weight: 600;
    letter-spacing: 1px; animation: qz-fadeUp 0.3s ease both;
    text-align: center;
  }
  .qz-feedback--wrong { color: var(--red); }
  .qz-feedback--correct { color: var(--accent); }
  .qz-feedback--failed { color: var(--amber); }

  /* ── Animations ── */
  @keyframes qz-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes qz-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .qz-title { font-size: 18px; }
    .qz-title--thin { font-size: 14px; }
    .qz-options-grid { grid-template-columns: 1fr; }
    .qz-header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .qz-header__right { align-self: flex-end; }
    .qz-ascii-card { min-width: 44px; padding: 8px 12px; }
    .qz-ascii-card__num { font-size: 16px; }
  }
`;
