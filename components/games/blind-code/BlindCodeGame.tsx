"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import AttemptsHearts from "@/components/games/AttemptsHearts";
import { getGameScreen } from "@/lib/gameMessages";
import type { MessageCode } from "@/lib/types/teamGameState";
import CoderGhost from "@/components/CoderGhost";

export default function BlindCodeGame() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lineCount, setLineCount] = useState(10);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Round data
  const [currentRound, setCurrentRound] = useState<{ id: string; number: number } | null>(null);
  const [targetString, setTargetString] = useState("");
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
  const [output, setOutput] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

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

  // top of component — track typing state with a timeout ref
  const [ghostTyping, setGhostTyping] = useState(false);
  const ghostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typing Sound Effects
  const keySoundsRef = useRef<HTMLAudioElement[]>([]);
  const keyIndexRef = useRef(0);
  const spaceSoundsRef = useRef<HTMLAudioElement[]>([]);
  const spaceIndexRef = useRef(0);
  useEffect(() => {
    keySoundsRef.current = Array.from({ length: 6 }, () => new Audio("/sounds/kay_press.mp3"));
    spaceSoundsRef.current = Array.from({ length: 3 }, () => new Audio("/sounds/space_bar.mp3"));
  }, []);
  function playTypingSound(key: string) {
    if (key === " ") {
      const pool = spaceSoundsRef.current;
      const sound = pool[spaceIndexRef.current % pool.length];
      sound.currentTime = 0;
      sound.play();
      spaceIndexRef.current++;
    } else {
      const pool = keySoundsRef.current;
      const sound = pool[keyIndexRef.current % pool.length];
      sound.currentTime = 0;
      sound.play();
      keyIndexRef.current++;
    }
  }

  function triggerGhostTyping() {
    setGhostTyping(true);
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current);
    }
    ghostTimeoutRef.current = setTimeout(() => setGhostTyping(false), 1200);
  }

  const fetchCurrentRoundRef = useRef<() => void>(() => {});
  const lastLocalSubmitRef = useRef(0);

  async function fetchCurrentRound() {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/games/current/round", {
        credentials: "include",
      });

      const json = res.ok ? await res.json() : null;
      console.log("ROUND API: ", json);

      const screen = getGameScreen(json?.messageCode as MessageCode | undefined);

      setIsFinished(screen === "finished" || screen === "rounds_done");
      setIsRoundFailed(screen === "failed");
      setIsGameEnded(screen === "time_over");
      setIsWaiting(screen === "waiting");

      if (screen !== "playing") {
        setCurrentRound(null);
        return;
      }

      if (!json.roundId) {
        setIsWaiting(true);
        setCurrentRound(null);
        return;
      }

      setCurrentRound({ id: json.roundId, number: json.round });
      setTargetString(json.challenge);
      setAttemptsLeft(json.attemptsLeft ?? 3);
    } catch (err) {
      console.error("Round fetch error", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!currentRound || submitting || !code.trim()) return;

    try {
      setSubmitting(true);
      setResult(null);
      setOutput(null);
      setExecutionError(null);

      const res = await fetch(`/api/v1/rounds/${currentRound.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: code }),
        credentials: "include",
      });

      const json = await res.json();
      console.log("SUBMIT:", json);

      if (json.correct) {
        setResult("correct");
        setCode("");
        setCursorPosition(0);
        setLineCount(10);

        // Re-fetch to load the next round (resolver handles terminal states)
        lastLocalSubmitRef.current = Date.now();
        await fetchCurrentRound();
        setResult(null);
      } else {
        setResult("incorrect");

        if (json.data?.output) setOutput(json.data.output);
        if (json.data?.error) setExecutionError(json.data.error);
        if (json.attemptsLeft !== undefined) setAttemptsLeft(json.attemptsLeft);
        if (json.attemptsLeft === 0) setIsRoundFailed(true);
        playFail();
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => { fetchCurrentRoundRef.current = fetchCurrentRound; });

  useEffect(() => {
    fetchCurrentRoundRef.current();

    const channel = supabase
      .channel("realtime:games:blind-code")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        () => { fetchCurrentRoundRef.current(); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams" },
        () => { fetchCurrentRoundRef.current(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_round_progress" },
        () => { if (Date.now() - lastLocalSubmitRef.current > 1000) fetchCurrentRoundRef.current(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    return () => {
      if (ghostTimeoutRef.current) {
        clearTimeout(ghostTimeoutRef.current);
      }
    };
  }, []);

  // Keep the textarea caret aligned with our virtual cursor state.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const nextCursorPosition = Math.min(cursorPosition, code.length);
    if (nextCursorPosition !== cursorPosition) {
      setCursorPosition(nextCursorPosition);
      return;
    }

    ta.selectionStart = nextCursorPosition;
    ta.selectionEnd = nextCursorPosition;
  }, [code, cursorPosition]);

  // Recalculate line count whenever code changes
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(Math.max(10, lines + 2));
  }, [code]);

  // No-op: all input is handled in onKeyDown; onChange is required by React for controlled inputs
  const handleChange = () => { };

  const insertAtCursor = (text: string) => {
    setCode(prev => `${prev.slice(0, cursorPosition)}${text}${prev.slice(cursorPosition)}`);
    setCursorPosition(prev => prev + text.length);
    setResult(null);
  };

  const moveCursorVertically = (direction: -1 | 1) => {
    const lineStarts = [0];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === "\n") {
        lineStarts.push(i + 1);
      }
    }

    let currentLine = 0;
    for (let i = 0; i < lineStarts.length; i++) {
      if (lineStarts[i] <= cursorPosition) {
        currentLine = i;
      } else {
        break;
      }
    }

    const targetLine = currentLine + direction;
    if (targetLine < 0 || targetLine >= lineStarts.length) {
      return cursorPosition;
    }

    const column = cursorPosition - lineStarts[currentLine];
    const targetLineStart = lineStarts[targetLine];
    const targetLineEnd =
      targetLine + 1 < lineStarts.length ? lineStarts[targetLine + 1] - 1 : code.length;
    const targetLineLength = targetLineEnd - targetLineStart;

    return targetLineStart + Math.min(column, targetLineLength);
  };

  const syncCursorFromTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    setCursorPosition(ta.selectionStart ?? 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter --> Run & Submit (no ghost trigger)
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCursorPosition(prev => Math.max(0, prev - 1));
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCursorPosition(prev => Math.min(code.length, prev + 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursorPosition(moveCursorVertically(-1));
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursorPosition(moveCursorVertically(1));
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        const lineStart = code.lastIndexOf("\n", Math.max(cursorPosition - 1, 0)) + 1;
        setCursorPosition(lineStart);
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        const nextNewline = code.indexOf("\n", cursorPosition);
        setCursorPosition(nextNewline === -1 ? code.length : nextNewline);
        return;
      }
    }

    // Tab --> insert 4 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor("    ");
      playTypingSound(e.key);
      triggerGhostTyping();
      return;
    }

    // Enter --> insert newline
    if (e.key === "Enter") {
      e.preventDefault();
      insertAtCursor("\n");
      playTypingSound(e.key);
      triggerGhostTyping();
      return;
    }

    // Backspace --> remove previous character
    if (e.key === "Backspace") {
      e.preventDefault();
      if (cursorPosition === 0) return;
      setCode(prev => `${prev.slice(0, cursorPosition - 1)}${prev.slice(cursorPosition)}`);
      setCursorPosition(prev => Math.max(0, prev - 1));
      setResult(null);
      playTypingSound(e.key);
      triggerGhostTyping();
      return;
    }

    // Delete --> remove current character
    if (e.key === "Delete") {
      e.preventDefault();
      if (cursorPosition >= code.length) return;
      setCode(prev => `${prev.slice(0, cursorPosition)}${prev.slice(cursorPosition + 1)}`);
      setResult(null);
      playTypingSound(e.key);
      triggerGhostTyping();
      return;
    }

    // Printable character (exclude ctrl/meta combos like Ctrl+A, Ctrl+C)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      insertAtCursor(e.key);
      playTypingSound(e.key);
      triggerGhostTyping();
    }
  };

  // ── UI states ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-muted-foreground/30 animate-fade-in">
        <span className="animate-pulse">loading...</span>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-muted-foreground/50 animate-fade-in">
        waiting for admin to start blind code...
      </div>
    );
  }

  if (isRoundFailed) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-destructive animate-fade-in">
        attempts exhausted — your run ends here.
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 font-mono animate-fade-in">
        <span className="text-sm text-success">Round Cleared. Well Played.</span>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-success/10 border border-success/25 text-success text-xs rounded-md px-5 py-2 transition-all duration-200 hover:bg-success/15 hover:border-success/35 active:scale-[0.97]"
        >
          [ proceed to dashboard ]
        </button>
      </div>
    );
  }

  if (isGameEnded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 font-mono animate-fade-in">
        <span className="text-2xl font-bold text-destructive">The Blind Code has been ended by admin.</span>
        <button
          onClick={() => router.push("/dashboard")}
          className="border border-border text-muted-foreground text-xs rounded-md px-5 py-2 transition-all duration-200 hover:bg-muted hover:border-white/[0.1] active:scale-[0.97]"
        >
          [ proceed to dashboard ]
        </button>
      </div>
    );
  }

  // ── Main game UI ───────────────────────────────────────────────────────────

  return (
    <div className="font-mono rounded-xl overflow-hidden border border-border bg-background flex flex-col h-full flex-1">

      {/* Terminal bar */}
      <div className="bg-muted/50 border-b border-border px-4 py-2.5 flex items-center gap-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <div className="w-2.5 h-2.5 rounded-full bg-success" />
        <span className="text-[11px] text-muted-foreground/40 ml-2">blind_code_terminal</span>
        <span className="ml-auto text-[10px] text-success/40">● LIVE</span>
      </div>

      {/* Target string */}
      <div className="px-6 py-4 border-b border-border/60 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[12px] tracking-widest text-muted-foreground uppercase">
            target output — print this exact string
          </span>
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-md px-3 py-1 text-[12px] font-bold uppercase font-display text-primary"
              style={{
                letterSpacing: "0.16em",
                background: "hsl(var(--foreground) / 0.05)",
                border: "1px solid hsl(var(--foreground) / 0.09)",
                boxShadow: "inset 0 0.5px 0 hsl(var(--foreground) / 0.05)",
                backdropFilter: "blur(12px)",
              }}
            >
              ROUND {currentRound?.number}
            </span>
            <AttemptsHearts remaining={attemptsLeft} />
          </span>
        </div>
        <div className="bg-muted/30 border border-border border-l-2 border-l-success rounded-r-md px-4 py-3 text-success text-sm tracking-wide break-all leading-relaxed">
          {targetString}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Editor bar */}
        <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] tracking-widest text-muted-foreground uppercase">editor</span>
            <span className="text-[10px] text-muted-foreground/60">Main.java</span>
          </div>
          <span className="bg-muted border border-border rounded px-2 py-0.5 text-[10px] text-white/40">Java</span>
        </div>

        {/* Code area */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Line numbers */}
          <div className="w-9 bg-background border-r border-border/60 py-4 flex flex-col shrink-0 overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[11px] text-muted-foreground/20 text-right pr-2 leading-[21px]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={syncCursorFromTextarea}
            onFocus={syncCursorFromTextarea}
            onSelect={syncCursorFromTextarea}
            spellCheck={false}
            disabled={submitting}
            placeholder={`// write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}`}
            className="flex-1 bg-transparent text-transparent text-[13px] leading-[21px] p-4 outline-none resize-none placeholder:text-muted-foreground/20 caret-transparent disabled:opacity-50 selection:bg-transparent"
          />
        </div>
      </div>

      {/* Output panel — shown when code output or error is returned */}
      {(output || executionError) && (
        <div className="border-t border-border/60 px-6 py-3 shrink-0 flex flex-col gap-2">
          {output && (
            <div>
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">your output</div>
              <div className="text-[12px] text-muted-foreground break-all leading-relaxed">{output}</div>
            </div>
          )}
          {executionError && (
            <div>
              <div className="text-[10px] text-destructive/50 uppercase tracking-widest mb-1">error</div>
              <div className="text-[12px] text-destructive/80 break-all leading-relaxed">{executionError}</div>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div className="bg-muted/50 border-t border-border px-4 py-2.5 flex items-center shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          {submitting && (
            <span className="text-warning">
              <svg className="inline mr-1" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none" /></svg>
              running...
            </span>
          )}
          {!submitting && result === "correct" && (
            <span className="text-success flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M3.5 6l2 2 3-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              correct — advancing...
            </span>
          )}
          {!submitting && result === "incorrect" && (
            <span className="text-destructive flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              wrong output — {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <CoderGhost isTyping={ghostTyping} className="mr-1" />
          <span className="text-[10px] text-white/80">{code.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || submitting}
            className="relative group flex items-center gap-2 px-4 py-1.5 text-xs font-mono rounded-md border transition-all duration-200
    bg-success/5 border-success/20 text-success
    hover:bg-success/10 hover:border-success/40 hover:shadow-[0_0_12px_rgba(var(--color-success),0.15)]
    active:scale-[0.97]
    disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:bg-success/5 disabled:hover:border-success/20"
          >
            {/* left accent bar */}
            <span className="w-[2px] h-3 rounded-full bg-success/60 group-hover:bg-success transition-colors duration-200" />

            {submitting ? (
              <>
                <span className="animate-pulse">running</span>
                <span className="tracking-widest animate-pulse">...</span>
              </>
            ) : (
              <span className="tracking-wide">Submit</span>
            )}

            {/* tooltip */}
            {!submitting && (
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-white/10 bg-black/90 px-2 py-1 text-[10px] text-white/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                Ctrl + Enter
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
