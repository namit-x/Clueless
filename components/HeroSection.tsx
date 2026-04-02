'use client'
import React, { useRef, useState } from "react";
import CountDown from "@/components/CountDown";
import HeroGhost from "@/components/HeroGhost";

const LetterTilt = ({ char }: { char: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const lastRot = useRef(0);
  const [rot, setRot] = useState(0);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    // -1 to 1 across the letter width → max ±22 deg
    const r = ((e.clientX - left) / width - 0.5) * 2 * 22;
    setRot(r);
    lastRot.current = r;
  };

  const onLeave = () => {
    // spring to opposite side, then settle
    setRot(-lastRot.current * 0.55);
    setTimeout(() => setRot(0), 220);
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        display: "inline-block",
        transform: `rotate(${rot}deg) translateY(${-Math.abs(rot) * 0.18}px)`,
        transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom center",
      }}
    >
      {char}
    </span>
  );
};

const HeroSection = ({ animate }: { animate?: boolean }) => {

  const bounceStyle = (delay: string): React.CSSProperties => animate
    ? { animation: `heroBounce 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) ${delay} both` }
    : {};

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-cyan/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-purple/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider mb-6 animate-fade-up">
          <span className="inline-flex items-start gap-0 sm:gap-1 md:gap-2">
            <span
              className="text-4xl sm:text-5xl md:text-7xl text-primary neon-text"
              style={{ display: "inline-block", ...bounceStyle("0.08s") }}
            >
              {"ClueLess".split("").map((char, i) => (
                <LetterTilt key={i} char={char} />
              ))}
            </span>
            {/* <HeroGhost className="-ml-1 sm:ml-0 md:ml-1 -translate-y-2 sm:-translate-y-3" /> */}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s", ...bounceStyle("0.16s") }}>
          Four Rounds. Four Words. Fastest Mind Wins.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.4s", ...bounceStyle("0.24s") }}>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider neon-glow-strong hover:scale-105 transition-transform duration-200"
          >
            REGISTER NOW
          </a>
          <a
            href="#rules"
            className="px-8 py-3.5 rounded-lg border border-primary/50 text-primary font-display font-bold text-sm tracking-wider hover:bg-primary/10 transition-all duration-200"
          >
            VIEW RULES
          </a>
        </div>
        <CountDown />
        <br />
        <br />
        <div className="flex justify-center items-center">
          <HeroGhost className="-translate-y-2 sm:-translate-y-3" />
        </div>
      </div>

      <style>{`
        @keyframes heroBounce {
          0%   { transform: scale(1); }
          25%  { transform: scale(0.82); }
          55%  { transform: scale(1.12); }
          75%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
