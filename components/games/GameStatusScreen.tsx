"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

export type GameStatusVariant =
  | "loading"
  | "waiting"
  | "failed"
  | "finished"
  | "ended"
  | "time_over";

interface GameStatusScreenProps {
  variant: GameStatusVariant;
  /** Game name shown in messages, e.g. "Blind Code", "Quiz" */
  gameName: string;
}

/* ═══════════════════════════════════════════════════════
   VARIANT CONFIG
   ═══════════════════════════════════════════════════════ */

interface VariantConfig {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
  accentVar: string; // CSS variable name like "--warning"
  showButton: boolean;
  buttonLabel: string;
}

function getConfig(variant: GameStatusVariant, gameName: string): VariantConfig {
  switch (variant) {
    case "loading":
      return {
        icon: <LoadingIcon />,
        label: "Loading",
        title: "Initializing...",
        subtitle: `Preparing ${gameName}`,
        accentVar: "--foreground",
        showButton: false,
        buttonLabel: "",
      };
    case "waiting":
      return {
        icon: <WaitingIcon />,
        label: "Standby",
        title: `Waiting for admin to start ${gameName}`,
        subtitle: "You'll be in the game as soon as it begins.",
        accentVar: "--warning",
        showButton: false,
        buttonLabel: "",
      };
    case "failed":
      return {
        icon: <FailedIcon />,
        label: "Game Over",
        title: "Attempts exhausted",
        subtitle: "Your run ends here.",
        accentVar: "--destructive",
        showButton: true,
        buttonLabel: "Return to dashboard",
      };
    case "finished":
      return {
        icon: <SuccessIcon />,
        label: "Completed",
        title: "Well played!",
        subtitle: `You've cleared ${gameName}. Great job.`,
        accentVar: "--success",
        showButton: true,
        buttonLabel: "Proceed to dashboard",
      };
    case "ended":
      return {
        icon: <EndedIcon />,
        label: "Terminated",
        title: `${gameName} ended by admin`,
        subtitle: "The game has been shut down.",
        accentVar: "--foreground",
        showButton: true,
        buttonLabel: "Return to dashboard",
      };
    case "time_over":
      return {
        icon: <TimeOverIcon />,
        label: "Time's Up",
        title: "Time has run out",
        subtitle: `${gameName} has ended.`,
        accentVar: "--warning",
        showButton: true,
        buttonLabel: "Return to dashboard",
      };
  }
}

/* ═══════════════════════════════════════════════════════
   ICONS (inline SVGs — small, consistent)
   ═══════════════════════════════════════════════════════ */

function LoadingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-spin" style={{ animationDuration: "2s" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.3" />
      <path d="M12 2v4" opacity="1" />
    </svg>
  );
}

function WaitingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" opacity="0.5" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FailedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" opacity="0.5" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" opacity="0.5" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function EndedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2L2 20h20L12 2z" fill="none" opacity="0.5" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TimeOverIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" opacity="0.5" />
      <polyline points="12 6 12 12 16 14" />
      <path d="M4 4l16 16" strokeWidth="2" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════ */

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
        transform: show ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {children}
    </div>
  );
}

function PulsingDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor: `hsl(${color})`,
        animation: "gss-blink 1.5s ease-in-out infinite",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function GameStatusScreen({ variant, gameName }: GameStatusScreenProps) {
  const router = useRouter();
  const config = getConfig(variant, gameName);

  const [dots, setDots] = useState("");
  useEffect(() => {
    if (variant !== "waiting" && variant !== "loading") return;
    const i = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 600);
    return () => clearInterval(i);
  }, [variant]);

  const goToDashboard = () => router.push("/dashboard");

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden bg-background"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 30% 40%, hsl(${config.accentVar} / 0.06) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 70% 60%, hsl(${config.accentVar} / 0.04) 0%, transparent 70%)
        `,
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(var(--foreground) / 0.02) 40px, hsl(var(--foreground) / 0.02) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(var(--foreground) / 0.02) 40px, hsl(var(--foreground) / 0.02) 41px)
          `,
        }}
      />

      <FadeIn delay={100} className="relative z-10 flex flex-col items-center gap-6">
        {/* Icon circle */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            color: `hsl(${config.accentVar})`,
            background: `hsl(${config.accentVar} / 0.04)`,
            border: `0.5px solid hsl(${config.accentVar} / 0.12)`,
          }}
        >
          {config.icon}
        </div>

        {/* Glass card */}
        <div
          className="relative rounded-2xl px-10 py-10 text-center max-w-md w-full"
          style={{
            background: "hsl(var(--foreground) / 0.03)",
            border: "0.5px solid hsl(var(--foreground) / 0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "inset 0 0.5px 0 hsl(var(--foreground) / 0.08)",
          }}
        >
          {/* Label */}
          <span
            className="text-[10px] uppercase tracking-[0.15em] block mb-4"
            style={{ color: `hsl(${config.accentVar} / 0.45)` }}
          >
            {config.label}
          </span>

          {/* Divider */}
          <div
            style={{
              width: 32,
              height: "0.5px",
              background: `hsl(${config.accentVar} / 0.13)`,
              margin: "0 auto 16px",
            }}
          />

          {/* Title */}
          <h2
            className="text-lg font-medium mb-2"
            style={{
              color: `hsl(${config.accentVar})`,
              letterSpacing: "0.03em",
            }}
          >
            {config.title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm leading-relaxed m-0 text-muted-foreground/40">
            {config.subtitle}
          </p>
        </div>

        {/* Status indicator for waiting/loading */}
        {(variant === "waiting" || variant === "loading") && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/25">
            <PulsingDot color={config.accentVar} />
            <span className="uppercase tracking-[0.2em]">
              {variant === "waiting" ? "listening" : "loading"}{dots}
            </span>
          </div>
        )}

        {/* Dashboard button */}
        {config.showButton && (
          <FadeIn delay={800}>
            <button
              onClick={goToDashboard}
              className="relative overflow-hidden rounded-xl px-6 py-3 text-sm cursor-pointer transition-all duration-200"
              style={{
                background: "hsl(var(--foreground) / 0.03)",
                border: `0.5px solid hsl(${config.accentVar} / 0.19)`,
                color: `hsl(${config.accentVar})`,
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `hsl(${config.accentVar} / 0.07)`;
                e.currentTarget.style.boxShadow = `0 0 30px hsl(${config.accentVar} / 0.08)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "hsl(var(--foreground) / 0.03)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {config.buttonLabel}
            </button>
          </FadeIn>
        )}
      </FadeIn>

      <style>{`
        @keyframes gss-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOATING LOADING GHOST
   Renders fixed over the viewport — use this between
   round transitions so the game UI isn't wiped.
   ═══════════════════════════════════════════════════════ */

export function FloatingLoadingGhost() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const i = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "hsl(var(--background) / 0.72)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Ghost */}
        <div style={{ animation: "flg-bob 2.2s ease-in-out infinite" }}>
          <svg viewBox="0 0 200 220" width="52" height="58" overflow="visible">
            <defs>
              <filter id="flg-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="rgba(134,239,172,0.35)" />
              </filter>
            </defs>
            {/* Body */}
            <path
              d="M42 95C42 52 66 30 100 30s58 22 58 65v54l-15-11-14 11-15-11-14 11-15-11-14 11V95Z"
              fill="#86efac"
              filter="url(#flg-glow)"
              style={{ animation: "flg-pulse 2.2s ease-in-out infinite" }}
            />
            {/* Eyes */}
            <ellipse cx="84" cy="84" rx="9" ry="11" fill="white" />
            <ellipse cx="116" cy="84" rx="9" ry="11" fill="white" />
            {/* Pupils — look slightly down while thinking */}
            <circle cx="84" cy="87" r="4.5" fill="#111" />
            <circle cx="116" cy="87" r="4.5" fill="#111" />
            {/* Mouth — neutral */}
            <path d="M91 106 Q100 112 109 106" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Label */}
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
          loading{dots}
        </span>
      </div>

      <style>{`
        @keyframes flg-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes flg-pulse {
          0%, 100% { opacity: 0.9; }
          50%       { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
