import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AttemptsHearts from "@/components/games/AttemptsHearts";

/* ═══════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════ */

function GridOverlay() {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 40px, #ffffff04 40px, #ffffff04 41px),
                    repeating-linear-gradient(90deg, transparent, transparent 40px, #ffffff04 40px, #ffffff04 41px)
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
                background: "#ffffff07",
                border: "0.5px solid #ffffff14",
                backdropFilter: "blur(20px)",
                boxShadow: "inset 0 0.5px 0 #ffffff14",
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
                <span className="animate-pulse" style={{ color: "#ffffff40" }}>▎</span>
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

function ProceedButton({ label = "proceed to dashboard", accentColor = "#ffffff", delay = 1800, onClick }: {
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
                background: "#ffffff07",
                border: `0.5px solid ${accentColor}30`,
                color: accentColor,
                backdropFilter: "blur(12px)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.6s ease, transform 0.6s ease, background 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = `${accentColor}12`;
                e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}15`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff07";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {label}
        </button>
    );
}

function FloatingOrbs({ color = "#ffffff", count = 6 }) {
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
                        background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
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

function RingPulse({ color = "#ffffff", size = 100 }: { color?: string; size?: number }) {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            {[0, 0.6, 1.2].map((d, i) => (
                <div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `0.5px solid ${color}${30 - i * 8}`,
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
                color: ["#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"][Math.floor(Math.random() * 5)],
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
            className={`flex-1 flex flex-col items-center justify-center gap-7 px-6 py-10 relative overflow-hidden ${className}`}
            style={{
                background: "#080c10",
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

    // ─── Fetch current round ───────────────────────────
    async function fetchCurrentRound() {
        try {
            setLoading(true);

            const res = await fetch("/api/v1/games/current/round", {
                credentials: "include",
            });

            const json = await res.json();
            console.log("ROUND API: ", json);

            if (!res.ok || !json.success) {
                setIsGameEnded(true);
                setIsFinished(false);
                setIsWaiting(false);
                setIsRoundFailed(false);
                return;
            }

            if (json.status === "FAILED") {
                setIsRoundFailed(true);
                setIsWaiting(false);
                setIsGameEnded(false);
                setCurrentRound(null);
                setClue("");
                return;
            }

            if (!json.roundId) {
                setIsWaiting(true);
                setIsFinished(false);
                setIsGameEnded(false);
                setIsRoundFailed(false);
                setCurrentRound(null);
                setClue("");
                return;
            }

            setIsWaiting(false);
            setIsGameEnded(false);
            setIsRoundFailed(false);
            setAttemptsLeft(json.attemptsLeft ?? 3);

            setCurrentRound({
                id: json.roundId,
                number: json.round,
            });
            setClue(json.clue);
        } catch (err) {
            console.error("Round fetch error", err);
        } finally {
            setLoading(false);
        }
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

        await fetchCurrentRound();
        setShowSuccess(false);
    }

    // ─── Realtime subscription ─────────────────────────
    useEffect(() => {
        fetchCurrentRound();

        const channel = supabase
            .channel("realtime:games:treasure-hunt")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "games" },
                () => {
                    fetchCurrentRound();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const goToDashboard = () => router.push("/dashboard");

    /* ═══════════════════════════════════════════════════
       LOADING
       ═══════════════════════════════════════════════════ */
    if (loading) {
        return (
            <StateScreen bgGradients="">
                <div className="flex gap-1.5 relative z-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-full"
                            style={{
                                width: 6,
                                height: 6,
                                background: "#ffffff30",
                                animation: `dotPulse 1.2s ${i * 0.15}s ease-in-out infinite`,
                            }}
                        />
                    ))}
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] relative z-10" style={{ color: "#ffffff30" }}>
                    Loading round data
                </span>
                <style>{`
                    @keyframes dotPulse {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50%      { opacity: 1; transform: scale(1.5); }
                    }
                `}</style>
            </StateScreen>
        );
    }

    /* ═══════════════════════════════════════════════════
       WAITING FOR ADMIN
       ═══════════════════════════════════════════════════ */
    if (isWaiting) {
        return (
            <WaitingScreen />
        );
    }

    /* ═══════════════════════════════════════════════════
       ROUND FAILED
       ═══════════════════════════════════════════════════ */
    if (isRoundFailed) {
        return (
            <StateScreen
                bgGradients={`
                    radial-gradient(ellipse 60% 50% at 40% 30%, #2a0a0a44 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 60% 70%, #1a0a0a33 0%, transparent 70%)
                `}
            >
                <FloatingOrbs color="#ff6b6b" count={4} />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, transparent 50%, #ff000008 100%)" }}
                />

                <FadeIn delay={100} className="relative z-10 flex flex-col items-center gap-6">
                    {/* Icon */}
                    <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                            width: 80,
                            height: 80,
                            background: "#ff6b6b08",
                            border: "0.5px solid #ff6b6b20",
                            animation: "fadeShake 0.6s ease-out",
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="1" opacity="0.6" />
                            <path d="M8 8l8 8M16 8l-8 8" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <GlassCard className="max-w-md">
                        <span className="text-[10px] uppercase tracking-[0.15em] block mb-3" style={{ color: "#ff6b6b50" }}>
                            Mission Over
                        </span>
                        <div style={{ width: 32, height: "0.5px", background: "#ff6b6b20", margin: "0 auto 16px" }} />
                        <h2 className="text-xl font-medium mb-3" style={{ color: "#ff6b6b", letterSpacing: "0.05em" }}>
                            All attempts exhausted
                        </h2>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "#ffffff40" }}>
                            <Typewriter text="Your journey ends here. The trail has gone cold." speed={30} delay={500} />
                        </p>
                    </GlassCard>

                    <div className="flex items-center gap-4 text-[11px]" style={{ color: "#ffffff20" }}>
                        <span>Status: <span style={{ color: "#ff6b6b" }}>eliminated</span></span>
                        <span style={{ width: "0.5px", height: 12, background: "#ffffff15", display: "inline-block" }} />
                        <span>Attempts: <span style={{ color: "#ff6b6b" }}>0 remaining</span></span>
                    </div>

                    <ProceedButton label="Return to dashboard" accentColor="#ff6b6b" delay={1600} onClick={goToDashboard} />
                </FadeIn>

                <style>{`
                    @keyframes fadeShake {
                        0%   { transform: translateX(-4px); opacity: 0; }
                        25%  { transform: translateX(4px); }
                        50%  { transform: translateX(-2px); }
                        75%  { transform: translateX(2px); }
                        100% { transform: translateX(0); opacity: 1; }
                    }
                `}</style>
            </StateScreen>
        );
    }

    /* ═══════════════════════════════════════════════════
       FINISHED — SUCCESS
       ═══════════════════════════════════════════════════ */
    if (isFinished) {
        return (
            <StateScreen
                bgGradients={`
                    radial-gradient(ellipse 60% 50% at 30% 30%, #0a2a1244 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 70% 70%, #0a1a2a33 0%, transparent 70%)
                `}
            >
                <FloatingOrbs color="#4ade80" count={6} />
                {showConfetti && <Confetti />}

                <div
                    className="absolute pointer-events-none z-0"
                    style={{
                        width: 300,
                        height: 300,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle, #4ade8008 0%, transparent 70%)",
                        animation: "breathe 4s ease-in-out infinite",
                    }}
                />

                <FadeIn delay={200} className="relative z-10 flex flex-col items-center gap-6">
                    <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                            width: 90,
                            height: 90,
                            background: "#4ade8008",
                            border: "0.5px solid #4ade8020",
                        }}
                    >
                        <span className="text-4xl" style={{ animation: "popIn 0.6s 0.3s ease-out both" }}>🏆</span>
                    </div>

                    <GlassCard className="max-w-md">
                        <span className="text-[10px] uppercase tracking-[0.15em] block mb-3" style={{ color: "#4ade8060" }}>
                            Hunt Complete
                        </span>
                        <div style={{ width: 32, height: "0.5px", background: "#4ade8020", margin: "0 auto 16px" }} />
                        <h2 className="text-xl font-medium mb-3" style={{ color: "#4ade80", letterSpacing: "0.05em" }}>
                            You conquered the Treasure Hunt!
                        </h2>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "#ffffff40" }}>
                            <Typewriter text="Every clue decoded. Every location found. Well played." speed={30} delay={800} />
                        </p>
                    </GlassCard>

                    <div className="flex items-center gap-4 text-[11px]" style={{ color: "#ffffff20" }}>
                        <span>Status: <span style={{ color: "#4ade80" }}>victorious</span></span>
                        <span style={{ width: "0.5px", height: 12, background: "#ffffff15", display: "inline-block" }} />
                        <span>All rounds: <span style={{ color: "#4ade80" }}>cleared</span></span>
                    </div>

                    <ProceedButton label="Claim your glory" accentColor="#4ade80" delay={2200} onClick={goToDashboard} />
                </FadeIn>

                <style>{`
                    @keyframes breathe {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                        50%      { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
                    }
                    @keyframes popIn {
                        0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
                        70%  { transform: scale(1.15) rotate(5deg); }
                        100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                `}</style>
            </StateScreen>
        );
    }

    /* ═══════════════════════════════════════════════════
       GAME ENDED BY ADMIN
       ═══════════════════════════════════════════════════ */
    if (isGameEnded) {
        return (
            <StateScreen
                bgGradients={`
                    radial-gradient(ellipse 60% 50% at 40% 30%, #0a0a0a55 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 60% 70%, #0a0a1a33 0%, transparent 70%)
                `}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, transparent 60%, #00000040 100%)" }}
                />

                <FadeIn delay={100} className="relative z-10 flex flex-col items-center gap-6">
                    <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                            width: 80,
                            height: 80,
                            background: "#ffffff05",
                            border: "0.5px solid #ffffff12",
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 20h20L12 2z" stroke="#ffffff50" strokeWidth="1" fill="none" />
                            <path d="M12 10v4" stroke="#ffffff50" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="17" r="0.8" fill="#ffffff50" />
                        </svg>
                    </div>

                    <GlassCard className="max-w-md">
                        <span className="text-[10px] uppercase tracking-[0.15em] block mb-3" style={{ color: "#ffffff30" }}>
                            Terminated
                        </span>
                        <div style={{ width: 32, height: "0.5px", background: "#ffffff15", margin: "0 auto 16px" }} />
                        <h2 className="text-xl font-medium mb-3" style={{ color: "#ffffff70", letterSpacing: "0.05em" }}>
                            Hunt ended by admin
                        </h2>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "#ffffff30" }}>
                            <Typewriter text="The Treasure Hunt has been shut down. All active sessions are suspended." speed={28} delay={400} />
                        </p>
                    </GlassCard>

                    <div className="flex items-center gap-4 text-[11px]" style={{ color: "#ffffff18" }}>
                        <span>Signal: <span style={{ color: "#ffffff50" }}>offline</span></span>
                        <span style={{ width: "0.5px", height: 12, background: "#ffffff10", display: "inline-block" }} />
                        <span>Override: <span style={{ color: "#ffffff50" }}>admin</span></span>
                    </div>

                    <ProceedButton label="Return to dashboard" accentColor="#ffffff60" delay={1400} onClick={goToDashboard} />
                </FadeIn>
            </StateScreen>
        );
    }

    /* ═══════════════════════════════════════════════════
       ACTIVE GAMEPLAY (your existing UI — untouched)
       ═══════════════════════════════════════════════════ */
    return (
        <div
            className="flex-1 flex flex-col items-center justify-center gap-7 px-6 py-10 relative overflow-hidden"
            style={{
                background: "#080c10",
                backgroundImage: `
                    radial-gradient(ellipse 60% 50% at 20% 30%, #0f2a1e55 0%, transparent 70%),
                    radial-gradient(ellipse 50% 60% at 80% 70%, #1a0f2e55 0%, transparent 70%),
                    radial-gradient(ellipse 40% 40% at 60% 20%, #0a1f2e44 0%, transparent 60%)
                `,
            }}
        >
            <GridOverlay />

            {/* Round pill */}
            <div
                className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{ background: "#ffffff08", border: "0.5px solid #ffffff18", backdropFilter: "blur(12px)" }}
            >
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#ffffff44" }}>Round</span>
                <span className="text-xl font-medium font-mono text-[#e0e0e0]">{currentRound?.number}</span>
                <div style={{ width: "0.5px", height: 16, background: "#ffffff20" }} />
                <AttemptsHearts remaining={attemptsLeft} />
            </div>

            {/* Clue card */}
            <div
                className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-5 rounded-2xl px-10 py-12 text-center"
                style={{
                    background: "#ffffff07",
                    border: "0.5px solid #ffffff14",
                    backdropFilter: "blur(20px)",
                    boxShadow: "inset 0 0.5px 0 #ffffff14",
                }}
            >
                <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "#ffffff40" }}>Clue</span>
                <div style={{ width: 32, height: "0.5px", background: "#ffffff20" }} />
                <p className="text-3xl leading-relaxed m-0" style={{ color: "#e8e8e8", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                    {clue}
                </p>
            </div>

            {/* Answer row */}
            <div className="relative z-10 w-full max-w-2xl flex gap-3">
                <input
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                        background: "#ffffff07",
                        border: "0.5px solid #ffffff18",
                        color: "#e0e0e0",
                        backdropFilter: "blur(12px)",
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
                    className="rounded-xl px-6 py-3 text-sm text-[#e0e0e0] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                        background: "#ffffff10",
                        border: "0.5px solid #ffffff20",
                        backdropFilter: "blur(12px)",
                    }}
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </div>

            {/* Result boxes */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col gap-2">
                {isWrong && (
                    <div
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                        style={{ background: "#ff6b6b12", border: "0.5px solid #ff6b6b30", color: "#ff6b6b", backdropFilter: "blur(12px)" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.5" stroke="#ff6b6b" strokeWidth="1" fill="none" /><path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        Wrong answer — {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining.
                    </div>
                )}
                {showSuccess && (
                    <div
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                        style={{ background: "#4ade8012", border: "0.5px solid #4ade8030", color: "#4ade80", backdropFilter: "blur(12px)" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5.5" stroke="#4ade80" strokeWidth="1" fill="none" /><path d="M4 6.5l2.5 2.5L9.5 5" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
                radial-gradient(ellipse 60% 50% at 30% 40%, #1a1a0a44 0%, transparent 70%),
                radial-gradient(ellipse 50% 60% at 70% 60%, #1a150a44 0%, transparent 70%)
            `}
        >
            <FloatingOrbs color="#facc15" count={5} />

            <FadeIn delay={100} className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    <RingPulse color="#facc15" size={100} />
                    <span className="absolute text-3xl" style={{ animation: "gentleBob 3s ease-in-out infinite" }}>⏳</span>
                </div>

                <GlassCard className="max-w-md">
                    <span className="text-[10px] uppercase tracking-[0.15em] block mb-4" style={{ color: "#facc1560" }}>
                        Standby
                    </span>
                    <div style={{ width: 32, height: "0.5px", background: "#facc1520", margin: "0 auto 16px" }} />
                    <p className="text-lg leading-relaxed m-0" style={{ color: "#e8e8e8", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                        <Typewriter text="Waiting for the hunt to begin..." speed={40} delay={300} />
                    </p>
                </GlassCard>

                <div className="flex items-center gap-2 text-[11px]" style={{ color: "#ffffff25" }}>
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#facc15", animation: "blink 1.5s ease-in-out infinite" }}
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