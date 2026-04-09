import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AttemptsHearts from "@/components/games/AttemptsHearts";
import { getGameScreen } from "@/lib/gameMessages";
import type { MessageCode } from "@/lib/types/teamGameState";
import GameStatusScreen, { FloatingLoadingGhost } from "@/components/games/GameStatusScreen";
import { useAppSelector } from "@/store/hooks";
import {
    buildMeaningfulTeamRoundState,
    isMeaningfulTeamRoundStateEqual,
    logRealtimeDecision,
    shouldProcessCurrentTeamUpdateEvent,
    shouldProcessGameUpdateEvent,
    shouldProcessTeamRoundProgressEvent,
} from "@/lib/teamRoundRealtime";

/* ═══════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════ */

function GridOverlay() {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(var(--foreground) / 0.02) 40px, hsl(var(--foreground) / 0.02) 41px),
                    repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(var(--foreground) / 0.02) 40px, hsl(var(--foreground) / 0.02) 41px)
                `,
            }}
        />
    );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`relative rounded-2xl px-10 py-12 text-center ${className}`}
            style={{
                background: "hsl(var(--foreground) / 0.03)",
                border: "0.5px solid hsl(var(--foreground) / 0.08)",
                backdropFilter: "blur(20px)",
                boxShadow: "inset 0 0.5px 0 hsl(var(--foreground) / 0.08)",
            }}
        >
            {children}
        </div>
    );
}

function Typewriter({ text, speed = 30, delay = 400 }: { text: string; speed?: number; delay?: number }) {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    useEffect(() => {
        if (!started || displayed.length >= text.length) return;
        const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
        return () => clearTimeout(t);
    }, [started, displayed, text, speed]);

    return (
        <span>
            {displayed}
            {displayed.length < text.length && started && (
                <span className="animate-pulse" style={{ color: "hsl(var(--foreground) / 0.25)" }}>▎</span>
            )}
        </span>
    );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return (
        <div
            className={className}
            style={{
                opacity: show ? 1 : 0,
                transform: show ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
        >
            {children}
        </div>
    );
}

function ProceedButton({ label = "proceed to dashboard", accentColor = "var(--foreground)", delay = 1800, onClick }: {
    label?: string; accentColor?: string; delay?: number; onClick: () => void;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <button
            onClick={onClick}
            className="relative overflow-hidden rounded-xl px-6 py-3 text-sm cursor-pointer"
            style={{
                background: "hsl(var(--foreground) / 0.03)",
                border: `0.5px solid hsl(${accentColor} / 0.19)`,
                color: `hsl(${accentColor})`,
                backdropFilter: "blur(12px)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.6s ease, transform 0.6s ease, background 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = `hsl(${accentColor} / 0.07)`;
                e.currentTarget.style.boxShadow = `0 0 30px hsl(${accentColor} / 0.08)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "hsl(var(--foreground) / 0.03)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {label}
        </button>
    );
}

function FloatingOrbs({ color = "var(--foreground)", count = 6 }) {
    const orbs = useRef(
        Array.from({ length: count }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 60 + 30,
            duration: Math.random() * 15 + 12,
            delay: Math.random() * -10,
        }))
    ).current;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {orbs.map((o, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: `${o.x}%`,
                        top: `${o.y}%`,
                        width: o.size,
                        height: o.size,
                        background: `radial-gradient(circle, hsl(${color} / 0.03) 0%, transparent 70%)`,
                        animation: `orbFloat ${o.duration}s ${o.delay}s ease-in-out infinite alternate`,
                    }}
                />
            ))}
            <style>{`
                @keyframes orbFloat {
                    0%   { transform: translate(0, 0); }
                    100% { transform: translate(20px, -25px); }
                }
            `}</style>
        </div>
    );
}

function RingPulse({ color = "var(--foreground)", size = 100 }: { color?: string; size?: number }) {
    const opacities = [0.19, 0.13, 0.08];
    return (
        <div className="relative" style={{ width: size, height: size }}>
            {[0, 0.6, 1.2].map((d, i) => (
                <div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `0.5px solid hsl(${color} / ${opacities[i]})`,
                        animation: `ringExpand 3s ${d}s ease-out infinite`,
                    }}
                />
            ))}
            <style>{`
                @keyframes ringExpand {
                    0%   { transform: scale(0.8); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

function Confetti() {
    const [pieces, setPieces] = useState<any[]>([]);
    useEffect(() => {
        setPieces(
            Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: [
                    "hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--warning))",
                    "hsl(var(--secondary))", "hsl(var(--destructive))",
                ][Math.floor(Math.random() * 5)],
                w: Math.random() * 5 + 3,
                h: Math.random() * 8 + 4,
                delay: Math.random() * 1.5,
                duration: Math.random() * 2.5 + 2,
            }))
        );
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {pieces.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-0 rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        width: p.w,
                        height: p.h,
                        background: p.color,
                        opacity: 0,
                        animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                    }}
                />
            ))}
            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(-10px) rotate(0deg) scale(1); opacity: 0.9; }
                    80%  { opacity: 0.6; }
                    100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   STATE SCREEN WRAPPER (shared layout for all states)
   ═══════════════════════════════════════════════════════ */

function StateScreen({ children, bgGradients, className = "" }: {
    children: React.ReactNode;
    bgGradients: string;
    className?: string;
}) {
    return (
        <div
            className={`flex-1 flex flex-col items-center justify-center gap-7 px-6 py-10 relative overflow-hidden bg-background ${className}`}
            style={{
                backgroundImage: bgGradients,
            }}
        >
            <GridOverlay />
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function TreasureHuntGame() {
    const teamId = useAppSelector((state) => state.auth.user?.id ?? null);
    const [answer, setAnswer] = useState("");
    const [currentRound, setCurrentRound] = useState<any>(null);
    const [clue, setClue] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [isRoundFailed, setIsRoundFailed] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
    const [isWaiting, setIsWaiting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const router = useRouter();


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

    // ─── Fetch current round ───────────────────────────
    const fetchCurrentRoundRef = useRef<() => void>(() => { });
    const lastLocalSubmitRef = useRef(0);
    const lastAppliedMeaningfulStateRef = useRef<ReturnType<typeof buildMeaningfulTeamRoundState> | null>(null);
    const isFetchingRef = useRef(false);
    const pendingFetchRef = useRef(false);
    const debounceFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    async function fetchCurrentRound() {
        if (isFetchingRef.current) { pendingFetchRef.current = true; return; }
        isFetchingRef.current = true;
        const shouldShowLoading = lastAppliedMeaningfulStateRef.current === null;

        try {
            if (shouldShowLoading) setLoading(true);

            const res = await fetch("/api/v1/games/current/round", {
                credentials: "include",
            });

            const json = res.ok ? await res.json() : null;
            console.log("ROUND API: ", json);

            const nextMeaningfulState = buildMeaningfulTeamRoundState(json);
            if (
                isMeaningfulTeamRoundStateEqual(
                    lastAppliedMeaningfulStateRef.current,
                    nextMeaningfulState
                )
            ) {
                return;
            }

            lastAppliedMeaningfulStateRef.current = nextMeaningfulState;

            const screen = getGameScreen(json?.messageCode as MessageCode | undefined);

            setIsFinished(screen === "finished" || screen === "rounds_done");
            setIsRoundFailed(screen === "failed");
            setIsGameEnded(screen === "time_over");
            setIsWaiting(screen === "waiting");

            if (screen !== "playing") {
                setCurrentRound(null);
                setClue("");
                return;
            }

            if (!json.roundId) {
                setIsWaiting(true);
                setCurrentRound(null);
                setClue("");
                return;
            }

            setAttemptsLeft(json.attemptsLeft ?? 3);
            setCurrentRound({
                id: json.roundId,
                number: json.round,
            });
            setClue(json.clue);
        } catch (err) {
            console.error("Round fetch error", err);
        } finally {
            if (shouldShowLoading) setLoading(false);
            isFetchingRef.current = false;
            if (pendingFetchRef.current) {
                pendingFetchRef.current = false;
                fetchCurrentRoundRef.current();
            }
        }
    }

    function scheduleFetchCurrentRound() {
        if (debounceFetchRef.current) clearTimeout(debounceFetchRef.current);

        debounceFetchRef.current = setTimeout(() => {
            fetchCurrentRoundRef.current();
        }, 200);
    }

    // ─── Submit answer ─────────────────────────────────
    async function submitAnswer() {
        if (!currentRound || submitting || !answer.trim()) return;

        try {
            setSubmitting(true);

            const res = await fetch(
                `/api/v1/rounds/${currentRound.id}/submissions`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answer }),
                    credentials: "include",
                }
            );

            const json = await res.json();
            console.log("SUBMIT API: ", json);

            if (json.status === "CORRECT" || json.status === "COMPLETED") {
                await handleCorrectFlow(json);
            } else if (json.status === "INCORRECT") {
                handleWrongFlow(json.attemptsLeft ?? 0);
            } else if (json.status === "FAILED") {
                setIsRoundFailed(true);
            }
        } catch (err) {
            console.error("Submit error", err);
        } finally {
            setSubmitting(false);
        }
    }

    function handleWrongFlow(remaining: number) {
        setShowSuccess(false);
        setIsWrong(true);
        playFail();
        setAttemptsLeft(remaining);
    }

    async function handleCorrectFlow(submitResult: any) {
        setIsWrong(false);
        setShowSuccess(true);
        setAnswer("");

        if (submitResult.status === "COMPLETED") {
            setIsFinished(true);
            setShowConfetti(true);
            return;
        }

        lastLocalSubmitRef.current = Date.now();
        await fetchCurrentRound();
        setShowSuccess(false);
    }

    useEffect(() => { fetchCurrentRoundRef.current = fetchCurrentRound; });

    // ─── Realtime subscription ─────────────────────────
    useEffect(() => {
        lastAppliedMeaningfulStateRef.current = null;
        fetchCurrentRoundRef.current();

        const teamRoundProgressConfig = {
            event: "UPDATE" as const,
            schema: "public",
            table: "team_round_progress",
            ...(teamId ? { filter: `team_id=eq.${teamId}` } : {}),
        };
        const teamsSubscriptionConfig = {
            event: "UPDATE" as const,
            schema: "public",
            table: "teams",
            ...(teamId ? { filter: `team_id=eq.${teamId}` } : {}),
        };

        const channel = supabase
            .channel("realtime:games:treasure-hunt")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "games" },
                (payload) => {
                    const shouldFetch = shouldProcessGameUpdateEvent(payload);
                    logRealtimeDecision({
                        table: "games",
                        currentTeamId: teamId,
                        shouldFetch,
                        reason: shouldFetch ? "game status changed" : "ignored unchanged game update",
                    });

                    if (!shouldFetch) return;
                    scheduleFetchCurrentRound();
                }
            )
            .on(
                "postgres_changes",
                teamsSubscriptionConfig,
                (payload) => {
                    const eventTeamId = payload.new.team_id ?? payload.old.team_id ?? null;
                    const shouldFetch = shouldProcessCurrentTeamUpdateEvent(payload, teamId);
                    logRealtimeDecision({
                        table: "teams",
                        currentTeamId: teamId,
                        eventTeamId,
                        shouldFetch,
                        reason: shouldFetch ? "current team approval changed" : "ignored other team or unchanged team update",
                    });

                    if (!shouldFetch) return;
                    scheduleFetchCurrentRound();
                }
            )
            .on(
                "postgres_changes",
                teamRoundProgressConfig,
                (payload) => {
                    const eventTeamId = payload.new.team_id ?? payload.old.team_id ?? null;
                    if (Date.now() - lastLocalSubmitRef.current <= 1000) {
                        logRealtimeDecision({
                            table: "team_round_progress",
                            currentTeamId: teamId,
                            eventTeamId,
                            shouldFetch: false,
                            reason: "ignored local submit echo",
                        });
                        return;
                    }

                    const shouldFetch = shouldProcessTeamRoundProgressEvent(payload, teamId);
                    logRealtimeDecision({
                        table: "team_round_progress",
                        currentTeamId: teamId,
                        eventTeamId,
                        shouldFetch,
                        reason: shouldFetch ? "meaningful team round change" : "ignored other team or non-meaningful round update",
                    });

                    if (!shouldFetch) return;

                    scheduleFetchCurrentRound();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (debounceFetchRef.current) clearTimeout(debounceFetchRef.current);
        };
    }, [teamId]);

    const goToDashboard = () => router.push("/dashboard");

    if (loading) return <FloatingLoadingGhost />;
    if (isWaiting) return <GameStatusScreen variant="waiting" gameName="Treasure Hunt" />;
    if (isRoundFailed) return <GameStatusScreen variant="failed" gameName="Treasure Hunt" />;
    if (isFinished) return <GameStatusScreen variant="finished" gameName="Treasure Hunt" />;
    if (isGameEnded) return <GameStatusScreen variant="ended" gameName="Treasure Hunt" />;

    /* ═══════════════════════════════════════════════════
       ACTIVE GAMEPLAY (your existing UI — untouched)
       ═══════════════════════════════════════════════════ */
    return (
        <div
            className="flex-1 flex flex-col items-center justify-center gap-7 px-6 py-10 relative overflow-hidden bg-background"
            style={{
                backgroundImage: `
                    radial-gradient(ellipse 60% 50% at 20% 30%, hsl(var(--success) / 0.08) 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 80% 70%, hsl(var(--secondary) / 0.08) 0%, transparent 70%),
                    radial-gradient(ellipse 40% 40% at 60% 20%, hsl(var(--primary) / 0.07) 0%, transparent 60%)
                `,
            }}
        >
            <GridOverlay />

            {/* Match the digit manipulation round/hearts placement */}
            <div className="absolute left-6 right-6 top-10 z-20 flex items-center justify-between">
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
            </div>

            {/* Clue card */}
            <div
                className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-5 rounded-2xl px-10 py-12 text-center"
                style={{
                    background: "hsl(var(--foreground) / 0.03)",
                    border: "0.5px solid hsl(var(--foreground) / 0.08)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "inset 0 0.5px 0 hsl(var(--foreground) / 0.08)",
                }}
            >
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">Clue</span>
                <div style={{ width: 32, height: "0.5px", background: "hsl(var(--foreground) / 0.13)" }} />
                <p className="text-3xl leading-relaxed m-0 text-foreground/90 italic">
                    {clue}
                </p>
            </div>

            {/* Answer row */}
            <div className="relative z-10 w-full max-w-2xl flex gap-3">
                <input
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none text-foreground"
                    style={{
                        background: "hsl(var(--foreground) / 0.03)",
                        border: "0.5px solid hsl(var(--foreground) / 0.09)",
                        backdropFilter: "blur(12px)",
                        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.3)";
                        e.currentTarget.style.boxShadow = "0 0 20px hsl(var(--primary) / 0.06)";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.09)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Enter your answer..."
                    value={answer}
                    onChange={(e) => { setAnswer(e.target.value); setIsWrong(false); setShowSuccess(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") submitAnswer(); }}
                    disabled={submitting}
                />
                <button
                    onClick={submitAnswer}
                    disabled={submitting || loading || !answer.trim()}
                    className="rounded-xl px-6 py-3 text-sm text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        background: "hsl(var(--foreground) / 0.06)",
                        border: "0.5px solid hsl(var(--foreground) / 0.13)",
                        backdropFilter: "blur(12px)",
                        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                    }}
                    onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = "hsl(var(--foreground) / 0.1)";
                            e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.2)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "hsl(var(--foreground) / 0.06)";
                        e.currentTarget.style.borderColor = "hsl(var(--foreground) / 0.13)";
                    }}
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </div>

            {/* Result boxes */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col gap-2">
                {isWrong && (
                    <div
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-destructive animate-slide-up"
                        style={{ background: "hsl(var(--destructive) / 0.07)", border: "0.5px solid hsl(var(--destructive) / 0.19)", backdropFilter: "blur(12px)" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        Wrong answer — {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining.
                    </div>
                )}
                {showSuccess && (
                    <div
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-success animate-slide-up"
                        style={{ background: "hsl(var(--success) / 0.07)", border: "0.5px solid hsl(var(--success) / 0.19)", backdropFilter: "blur(12px)" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M4 6.5l2.5 2.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Correct — moving to next clue...
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   WAITING SCREEN (extracted for cleaner readability)
   ═══════════════════════════════════════════════════════ */

function WaitingScreen() {
    const [dots, setDots] = useState("");
    useEffect(() => {
        const i = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 600);
        return () => clearInterval(i);
    }, []);

    return (
        <StateScreen
            bgGradients={`
                radial-gradient(ellipse 60% 50% at 30% 40%, hsl(var(--warning) / 0.07) 0%, transparent 70%),
                radial-gradient(ellipse 50% 60% at 70% 60%, hsl(var(--warning) / 0.05) 0%, transparent 70%)
            `}
        >
            <FloatingOrbs color="var(--warning)" count={5} />

            <FadeIn delay={100} className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    <RingPulse color="var(--warning)" size={100} />
                    <span className="absolute text-3xl" style={{ animation: "gentleBob 3s ease-in-out infinite" }}>⏳</span>
                </div>

                <GlassCard className="max-w-md">
                    <span className="text-[10px] uppercase tracking-[0.15em] block mb-4 text-warning/40">
                        Standby
                    </span>
                    <div style={{ width: 32, height: "0.5px", background: "hsl(var(--warning) / 0.13)", margin: "0 auto 16px" }} />
                    <p className="text-lg leading-relaxed m-0 text-foreground/90 italic">
                        <Typewriter text="Waiting for the hunt to begin..." speed={40} delay={300} />
                    </p>
                </GlassCard>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/20">
                    <span
                        className="w-1.5 h-1.5 rounded-full bg-warning"
                        style={{ animation: "blink 1.5s ease-in-out infinite" }}
                    />
                    <span className="uppercase tracking-[0.2em]">listening{dots}</span>
                </div>
            </FadeIn>

            <style>{`
                @keyframes gentleBob {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.2; }
                }
            `}</style>
        </StateScreen>
    );
}
