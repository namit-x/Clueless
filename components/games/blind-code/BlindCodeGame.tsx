"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import AttemptsHearts from "@/components/games/AttemptsHearts";

export default function BlindCodeGame() {
  const router = useRouter();
  const [code, setCode] = useState("");
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

  async function fetchCurrentRound(afterCorrect = false) {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/games/current/round", {
        credentials: "include",
      });

      if (!res.ok) {
        if (afterCorrect) setIsFinished(true);
        else setIsGameEnded(true);
        setIsWaiting(false);
        setIsRoundFailed(false);
        return;
      }

      const json = await res.json();
      console.log("ROUND API: ", json);

      if (!json.success) {
        if (afterCorrect) setIsFinished(true);
        else setIsGameEnded(true);
        setIsWaiting(false);
        setIsRoundFailed(false);
        return;
      }

      // NOTE for backend: getBlindCodeRound should return status: "FAILED" when attempts exhausted
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
      setCurrentRound({ id: json.roundId, number: json.round });
      setTargetString(json.challenge);
      // NOTE for backend: getBlindCodeRound should return attemptsLeft
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
        setLineCount(10);

        // Re-fetch to load the next round (pass true so a failed fetch = completed)
        await fetchCurrentRound(true);
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

  useEffect(() => {
    fetchCurrentRound();

    const channel = supabase
      .channel("realtime:games:blind-code")
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    setResult(null);
    const lines = val.split("\n").length;
    setLineCount(Math.max(10, lines + 2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    // Ctrl + Enter --> Run & Submit
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }

    // Tab --> Insert spaces (4)
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const s = ta.selectionStart;
      const newVal = code.substring(0, s) + "    " + code.substring(ta.selectionEnd);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 4; }, 0);
    }

    // Play typing sound for printable keys, Enter, Backspace, Tab, Space, Arrow keys
    if (e.key.length === 1 || ["Enter", "Backspace", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      playTypingSound(e.key);
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
            round {currentRound?.number} · <AttemptsHearts remaining={attemptsLeft} />
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
          <span className="bg-muted border border-border rounded px-2 py-0.5 text-[10px] text-muted-foreground/40">Java</span>
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
            spellCheck={false}
            disabled={submitting}
            placeholder={`// write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}`}
            className="flex-1 bg-transparent text-transparent text-[13px] leading-[21px] p-4 outline-none resize-none placeholder:text-muted-foreground/20 caret-success disabled:opacity-50 selection:bg-transparent"
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
          <span className="text-[10px] text-muted-foreground/20">{code.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || submitting}
            className="relative group bg-success/10 border border-success/25 text-success text-xs rounded-md px-4 py-1.5 transition-all duration-200 hover:bg-success/15 hover:border-success/35 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? "[ running... ]" : "[ run & submit ]"}

            {/* tooltip */}
            {!submitting && (
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                Ctrl + Enter
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
