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

  async function fetchCurrentRound(afterCorrect = false) {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/games/current/round", { credentials: "include" });
      const json = await res.json();
      console.log("Fetch CUrrent Round:", json)

      if (!res.ok || !json.success) {
        // If we just answered correctly and there's no active round → all rounds done
        if (afterCorrect) {
          setIsFinished(true);
        } else {
          setIsGameEnded(true);
        }
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

      const res = await fetch(`/api/v1/rounds/${currentRound.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: code }),
        credentials: "include",
      });

      const json = await res.json();
      console.log("SUBMIT:", json);

      // NOTE for backend: submitBlindCodeAnswer should return:
      //   status: "CORRECT" | "INCORRECT" | "FAILED" | "COMPLETED"
      //   attemptsLeft: number
      //   output: string  (actual stdout from Judge0)
      // Currently returns: { success: true, correct: true | false }

      const isCorrect =
        json.status === "CORRECT" ||
        json.status === "COMPLETED" ||
        json.correct === true;

      if (isCorrect) {
        setResult("correct");
        setCode("");
        setLineCount(10);

        if (json.status === "COMPLETED") {
          setIsFinished(true);
          return;
        }

        // Re-fetch to load the next round (pass true so a failed fetch = completed)
        await fetchCurrentRound(true);
        setResult(null);
      } else {
        setResult("incorrect");

        if (json.output) setOutput(json.output);
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
      .channel("realtime:games:blind-code")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
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
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const s = ta.selectionStart;
      const newVal = code.substring(0, s) + "    " + code.substring(ta.selectionEnd);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 4; }, 0);
    }
  };

  // ── UI states ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-[#2a2a2a]">
        loading...
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-[#444]">
        waiting for admin to start blind code...
      </div>
    );
  }

  if (isRoundFailed) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-[#ff5f56]">
        attempts exhausted — your run ends here.
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 font-mono">
        <span className="text-sm text-[#27c93f]">Round Cleared. Well Played.</span>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-[#27c93f15] border border-[#27c93f40] text-[#27c93f] text-xs rounded-md px-5 py-2 hover:bg-[#27c93f25]"
        >
          [ proceed to dashboard ]
        </button>
      </div>
    );
  }

  if (isGameEnded) {
    return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 font-mono">
                <span className="text-2xl font-bold text-red-600">⚠️ The BLind Code has been ended by admin.</span>
                <button
                    onClick={() => router.push("/dashboard")}
                    className=" border  text-xs rounded-md px-5 py-2 hover:bg-gray-900"
                >
                    [ proceed to dashboard ]
                </button>
            </div>
    );
  }

  // ── Main game UI ───────────────────────────────────────────────────────────

  return (
    <div className="font-mono rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d] flex flex-col h-full flex-1">

      {/* Terminal bar */}
      <div className="bg-[#151515] border-b border-[#2a2a2a] px-4 py-2.5 flex items-center gap-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        <span className="text-[11px] text-gray-600 ml-2">blind_code_terminal</span>
        <span className="ml-auto text-[10px] text-[#00ff8866]">● LIVE</span>
      </div>

      {/* Target string */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[12px] tracking-widest text-gray-300 uppercase">
            target output — print this exact string
          </span>
          <span className="text-[10px] text-[#444] flex items-center gap-2">
            round {currentRound?.number} · <AttemptsHearts remaining={attemptsLeft} />
          </span>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] border-l-2 border-l-[#00ff88] rounded-r-md px-4 py-3 text-[#00ff88] text-sm tracking-wide break-all leading-relaxed">
          {targetString}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Editor bar */}
        <div className="bg-[#151515] border-b border-[#2a2a2a] px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] tracking-widest text-gray-400 uppercase">editor</span>
            <span className="text-[10px] text-gray-500">Main.java</span>
          </div>
          <span className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-0.5 text-[10px] text-[#555]">Java</span>
        </div>

        {/* Code area */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Line numbers */}
          <div className="w-9 bg-[#0d0d0d] border-r border-[#1a1a1a] py-4 flex flex-col shrink-0 overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[11px] text-[#2a2a2a] text-right pr-2 leading-[21px]">
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
            className="flex-1 bg-transparent text-[#e0e0e0] text-[13px] leading-[21px] p-4 outline-none resize-none placeholder:text-[#2a2a2a] caret-[#00ff88] disabled:opacity-50"
          />
        </div>
      </div>

      {/* Output panel — shown when code output is returned */}
      {output && (
        <div className="border-t border-[#1a1a1a] px-6 py-3 shrink-0">
          <div className="text-[10px] text-[#444] uppercase tracking-widest mb-1">your output</div>
          <div className="text-[12px] text-[#888] break-all leading-relaxed">{output}</div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="bg-[#151515] border-t border-[#2a2a2a] px-4 py-2.5 flex items-center shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          {submitting && (
            <span className="text-[#ffbd2e]">
              <svg className="inline mr-1" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" stroke="#ffbd2e" strokeWidth="1" fill="none" /></svg>
              running...
            </span>
          )}
          {!submitting && result === "correct" && (
            <span className="text-[#27c93f] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="#27c93f" strokeWidth="1" fill="none" /><path d="M3.5 6l2 2 3-3.5" stroke="#27c93f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              correct — advancing...
            </span>
          )}
          {!submitting && result === "incorrect" && (
            <span className="text-[#ff5f56] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="#ff5f56" strokeWidth="1" fill="none" /><path d="M4 4l4 4M8 4l-4 4" stroke="#ff5f56" strokeWidth="1.2" strokeLinecap="round" /></svg>
              wrong output — {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] text-[#2a2a2a]">{code.length} chars</span>
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || submitting}
            className="bg-[#00ff8815] border border-[#00ff8840] text-[#00ff88] text-xs rounded-md px-4 py-1.5 hover:bg-[#00ff8825] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "[ running... ]" : "[ run & submit ]"}
          </button>
        </div>
      </div>

    </div>
  );
}
