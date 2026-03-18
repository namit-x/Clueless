import { useEffect, useState } from "react";

export default function TreasureHuntGame() {
    const [answer, setAnswer] = useState("");
    const [currentRound, setCurrentRound] = useState<any>(null);
    const [clue, setClue] = useState("");
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);

    // Fetch current round (single source of truth)

    //     async function fetchCurrentRound() {

    //         const res = await fetch("/api/v1/games/current/round", {
    //             credentials: "include",
    //         });

    //         const json = await res.json();
    //         console.log("ROUND API: ", json);
    //             // console.log("ROUND status:", res.status);
    //             // console.log("ROUND ok:", res.ok);
    //             // console.log("ROUND API:", json);

    // }
    async function fetchCurrentRound() {
        try {
            setLoading(true);

            const res = await fetch("/api/v1/games/current/round", {
                credentials: "include",
            });

            const json = await res.json();
            console.log("ROUND API: ", json);
            if (!res.ok || !json.success) {
                console.log("ROUND status:", res.status);
                console.log("ROUND ok:", res.ok);
                console.log("ROUND API:", json);

                setIsGameEnded(false);
                setIsFinished(false);
                setIsWaiting(false);
                return;
            }

            if (json.isEnded) {
                setIsGameEnded(true);
                setIsFinished(false);
                setIsWaiting(false);
                setCurrentRound(null);
                setClue("");
                return;
            }

            if (!json.roundId) {
                // restart OR not started
                setIsWaiting(true);
                setIsFinished(false);
                setIsGameEnded(false);
                setCurrentRound(null);
                setClue("");
                return;
            }

            setIsWaiting(false);
            setIsGameEnded(false);


            setCurrentRound({
                id: json.roundId,
                number: json.round
            });
            setClue(json.clue);
        } catch (err) {
            console.error("Round fetch error", err);
        } finally {
            setLoading(false);
        }
    }

    // Submit answer
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

            if (json.correct) {
                await handleCorrectFlow(json);
            } else {
                handleWrongFlow();
            }

        } catch (err) {
            console.error("Submit error", err);
        } finally {
            setSubmitting(false);
        }
    }

    function handleWrongFlow() {
        setShowSuccess(false);
        setIsWrong(true);
        // Refetch round data to sync attempt count
        setTimeout(() => {
            fetchCurrentRound();
        }, 1000);
    }

    async function handleCorrectFlow(submitResult: any) {
        setIsWrong(false);
        setShowSuccess(true);
        setAnswer("");
<<<<<<< Updated upstream
=======

        if (submitResult.gameCompleted) {
            setIsFinished(true);
            return;
        }

>>>>>>> Stashed changes
        await fetchCurrentRound();
        setShowSuccess(false);
    }

    // initial sync
    useEffect(() => {
        fetchCurrentRound();
    }, []);

    // UI states
    if (loading) return <div>Loading round...</div>;

    if (isWaiting) {
        return (
            <div className="text-2xl font-semibold">
                ⏳ Waiting for admin to start the Treasure Hunt...
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="text-2xl font-semibold text-green-400">
                🎉 You completed the Treasure Hunt!
            </div>
        );
    }

    if (isGameEnded) {
        return (
            <div className="text-2xl font-bold text-red-600">
                ⚠️ The Treasure Hunt has been ended by admin.
            </div>
        );
    }

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
            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 40px, #ffffff04 40px, #ffffff04 41px),
                        repeating-linear-gradient(90deg, transparent, transparent 40px, #ffffff04 40px, #ffffff04 41px)
                    `,
                }}
            />

            {/* Round pill */}
            <div
                className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{ background: "#ffffff08", border: "0.5px solid #ffffff18", backdropFilter: "blur(12px)" }}
            >
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#ffffff44" }}>Round</span>
                <span className="text-xl font-medium font-mono text-[#e0e0e0]">{currentRound?.number}</span>
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
                        Wrong answer — try again.
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