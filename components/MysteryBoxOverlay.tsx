"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Render a full-screen animated mystery box overlay that plays an open/burst sequence and notifies when finished.
 *
 * @param onComplete - Callback invoked once the opening sequence finishes (after the burst) to signal completion.
 * @returns The overlay element while the animation is active; `null` after the sequence completes.
 */
export default function MysteryBoxOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "opening" | "burst" | "done">(
    "idle"
  );

  const colors = [
    "#00E5FF",
    "#7B3FFF",
    "#1A6FFF",
    "#39FF14",
    "#00E5FF",
    "#7B3FFF",
  ];

  const rewardLetters = ["?", "?", "?", "?", "?", "?", "?"];

  const handleOpen = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("opening");

    setTimeout(() => setPhase("burst"), 600);
    setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 1400);
  }, [phase, onComplete]);

  const [particles, setParticles] = useState<
    { id: number; size: number; left: number; top: number; color: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 8 + 4,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "radial-gradient(ellipse at center, #0D1628 0%, #090D14 70%)",
        opacity: phase === "burst" ? 0 : 1,
        transform: phase === "burst" ? "scale(1.2)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Particles */}
      {/* <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              borderRadius: "50%",
              animation: `mysteryFloat ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.5,
            }}
          />
        ))}
      </div> */}

      {/* Box */}
      <div
        onClick={handleOpen}
        style={{
          position: "relative",
          width: 260,
          height: 300,
          cursor: phase === "idle" ? "pointer" : "default",
        }}
      >
        {/* Light burst */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,229,255,0.2) 0%, rgba(123,63,255,0.1) 30%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
            transform: "translate(-50%, -50%) scale(0)",
            opacity: 0,
            ...(phase === "opening" || phase === "burst"
              ? { animation: "mysteryBurst 1s ease-out forwards" }
              : {}),
          }}
        />

        {/* Flying reward items */}
        {/* {rewardEmojis.map((emoji, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              fontSize: 40,
              opacity: 0,
              pointerEvents: "none",
              zIndex: 3,
              ...(phase === "opening" || phase === "burst"
                ? {
                    animation: `mysteryFly${i} 1s ease-out forwards`,
                    animationDelay: `${0.1 + i * 0.05}s`,
                  }
                : {}),
            }}
          >
            {emoji}
          </div>
        ))} */}

        {/* Flying CLUELESS letters */}
        {rewardLetters.map((letter, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              fontSize: 48,
              fontFamily: "'Bangers', cursive",
              fontWeight: 900,
              color: "#00E5FF",
              textShadow: "0 0 12px #00E5FF",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 3,
              ...(phase === "opening" || phase === "burst"
                ? {
                    animation: `mysteryFly${i} 1s ease-out forwards`,
                    animationDelay: `${0.1 + i * 0.05}s`,
                  }
                : {}),
            }}
          >
            {letter}
          </div>
        ))}

        {/* Box wrapper with wobble */}
        <div
          style={{
            width: "100%",
            height: "100%",
            animation:
              phase === "idle"
                ? "mysteryWobble 2s ease-in-out infinite"
                : "mysteryExplode 0.8s forwards",
          }}
        >
          {/* Lid */}
          <div
            style={{
              position: "absolute",
              bottom: 160,
              left: "50%",
              width: 240,
              height: 50,
              background: "linear-gradient(135deg, #7B3FFF, #5B1FDD)",
              borderRadius: "12px 12px 4px 4px",
              border: "4px solid #00E5FF",
              boxShadow: "0 -4px 20px rgba(0,229,255,0.3)",
              transformOrigin: "bottom center",
              zIndex: 2,
              transform:
                phase !== "idle"
                  ? "translateX(-50%) rotateX(-120deg) translateY(-80px)"
                  : "translateX(-50%)",
              opacity: phase !== "idle" ? 0 : 1,
              transition:
                "transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.4s ease",
            }}
          >
            {/* Knob */}
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 40,
                height: 28,
                background: "#00E5FF",
                borderRadius: "50% 50% 4px 4px",
                boxShadow: "0 0 15px rgba(0,229,255,0.6)",
              }}
            />
          </div>

          {/* Box body */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              height: 180,
              background: "linear-gradient(135deg, #7B3FFF, #4B1FCC)",
              borderRadius: "16px 16px 20px 20px",
              border: "4px solid #00E5FF",
              boxShadow:
                "0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(123,63,255,0.3), inset 0 -20px 40px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Stripe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 50,
                height: "100%",
                background: "linear-gradient(180deg, #00E5FF, #7B3FFF)",
                opacity: 0.3,
              }}
            />
            {/* Question mark */}
            <span
              style={{
                fontFamily: "'Bangers', cursive",
                fontSize: 100,
                color: "#00E5FF",
                textShadow:
                  "0 0 20px rgba(0,229,255,0.7), 3px 3px 0 #7B3FFF",
                animation: "mysteryQuestion 1.5s ease-in-out infinite",
                position: "relative",
                zIndex: 1,
              }}
            >
              ?
            </span>
          </div>

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              height: 60,
              background:
                "radial-gradient(ellipse, rgba(0,229,255,0.35), transparent 70%)",
              borderRadius: "50%",
              animation: "mysteryGlow 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Tap text */}
      {phase === "idle" && (
        <p
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "rgba(0,229,255,0.6)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 40,
            animation: "mysteryTap 2s ease-in-out infinite",
          }}
        >
          Tap to open
        </p>
      )}

      {/* Keyframe styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');

        @keyframes mysteryFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.7; }
        }
        @keyframes mysteryWobble {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          25% { transform: rotate(1.5deg) translateY(-4px); }
          50% { transform: rotate(-0.5deg) translateY(-2px); }
          75% { transform: rotate(1deg) translateY(-6px); }
        }
        @keyframes mysteryExplode {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes mysteryBurst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes mysteryQuestion {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50% { transform: scale(1.1) rotate(3deg); }
        }
        @keyframes mysteryGlow {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
          50% { opacity: 1; transform: translateX(-50%) scaleX(1.2); }
        }
        @keyframes mysteryTap {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-5px); }
        }
        @keyframes mysteryFly0 {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + -120px), calc(-50% + -200px)) scale(1.2) rotate(-30deg); opacity: 0; }
        }
        @keyframes mysteryFly1 {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + 100px), calc(-50% + -220px)) scale(1.2) rotate(25deg); opacity: 0; }
        }
        @keyframes mysteryFly2 {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + -80px), calc(-50% + -180px)) scale(1.2) rotate(-45deg); opacity: 0; }
        }
        @keyframes mysteryFly3 {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + 130px), calc(-50% + -160px)) scale(1.2) rotate(40deg); opacity: 0; }
        }
        @keyframes mysteryFly4 {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + 0px), calc(-50% + -250px)) scale(1.2) rotate(10deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}