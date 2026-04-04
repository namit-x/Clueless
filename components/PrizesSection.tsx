"use client";

import { useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal"; 

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width;   // 0–1
    const y = (e.clientY - top) / height;   // 0–1
    const rotateX = (0.5 - y) * 16;         // -8 to 8 deg
    const rotateY = (x - 0.5) * 16;
    setTransform(
      `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`
    );
    setGlare({ x: x * 100, y: y * 100, opacity: 0.12 });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlare(g => ({ ...g, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform.includes("0deg") ? "transform 0.5s ease, box-shadow 0.5s ease" : "transform 0.1s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
        position: "relative",
      }}
    >
      {/* Glare overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "1rem",
          pointerEvents: "none",
          zIndex: 20,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
          transition: "opacity 0.3s ease",
        }}
      />
      {children}
    </div>
  );
}

// Display order: 2nd (left) · 1st (center, tallest) · 3rd (right)
const podium = [
  {
    rank: 2,
    icon: "🥈",
    label: "2nd Prize",
    reward: "₹3,000",
    stepHeight: 112,
    color: { text: "text-slate-300", border: "#94a3b8" },
    stepGrad: "linear-gradient(to bottom, rgba(148,163,184,0.22), rgba(71,85,105,0.06))",
    glow: "0 0 28px rgba(148,163,184,0.18), inset 0 1px 0 rgba(203,213,225,0.3)",
  },
  {
    rank: 1,
    icon: "🥇",
    label: "1st Prize",
    reward: "₹4,000",
    stepHeight: 176,
    color: { text: "text-yellow-400", border: "#facc15" },
    stepGrad: "linear-gradient(to bottom, rgba(250,204,21,0.28), rgba(161,98,7,0.08))",
    glow: "0 0 48px rgba(250,204,21,0.3), 0 0 96px rgba(250,204,21,0.1), inset 0 1px 0 rgba(253,224,71,0.5)",
  },
  {
    rank: 3,
    icon: "🥉",
    label: "3rd Prize",
    reward: "₹2,000",
    stepHeight: 72,
    color: { text: "text-amber-500", border: "#d97706" },
    stepGrad: "linear-gradient(to bottom, rgba(217,119,6,0.22), rgba(120,53,15,0.06))",
    glow: "0 0 28px rgba(217,119,6,0.2), inset 0 1px 0 rgba(251,191,36,0.3)",
  },
];

/* Decorative corner ornament used on the certificate */
const Corner = ({ className }: { className: string }) => (
  <span className={`absolute text-yellow-400/50 font-display font-black text-xl leading-none select-none ${className}`}>
    ◆
  </span>
);

const PrizesSection = () => (
  <section id="prizes" className="section-padding relative overflow-hidden">
    {/* Ambient spotlight */}
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 70%)" }}
      />
      <div
        className="absolute right-1/4 top-1/2 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(190,100%,50%,0.04) 0%, transparent 70%)" }}
      />
    </div>

    <div className="section-container relative z-10">
      {/* Header */}
      <ScrollReveal>
        <h2 className="section-title text-primary neon-text">Rewards</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-16">
          Glory, prizes, and bragging rights.
        </p>
      </ScrollReveal>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

        {/* ── LEFT: Podium ── */}
        <div className="flex-1 w-full max-w-xs sm:max-w-none mx-auto">
          <div className="flex items-end justify-center">
            {podium.map((p, i) => (
              <ScrollReveal key={p.rank} delay={i * 120} className="flex-1">
                <div className="flex flex-col items-center transition-transform duration-300 hover:scale-105 cursor-default">
                  <div className="text-center mb-3 md:mb-5 px-1">
                    {p.rank === 1 && (
                      <div className="text-lg md:text-2xl mb-1" style={{ filter: "drop-shadow(0 0 8px rgba(250,204,21,0.7))" }}>
                        👑
                      </div>
                    )}
                    <div
                      className={`mb-1 leading-none select-none ${p.rank === 1 ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}
                      style={p.rank === 1 ? { filter: "drop-shadow(0 0 10px rgba(250,204,21,0.5))" } : undefined}
                    >
                      {p.icon}
                    </div>
                    <p className={`font-display font-bold tracking-widest uppercase text-[9px] md:text-xs mb-1 ${p.color.text}`}>
                      {p.label}
                    </p>
                    <p
                      className={`font-display font-black ${p.rank === 1 ? "text-xl md:text-3xl" : "text-sm md:text-xl"} ${p.color.text}`}
                      style={{ textShadow: p.rank === 1 ? "0 0 16px rgba(250,204,21,0.4)" : undefined }}
                    >
                      {p.reward}
                    </p>
                  </div>

                  <div
                    className={`w-full relative overflow-hidden
                      ${p.rank === 1 ? "rounded-t-2xl" : p.rank === 2 ? "rounded-tl-xl" : "rounded-tr-xl"}`}
                    style={{
                      height: p.stepHeight,
                      background: p.stepGrad,
                      boxShadow: p.glow,
                      border: `1px solid ${p.color.border}33`,
                      borderBottom: "none",
                    }}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center font-display font-black select-none"
                      style={{
                        fontSize: p.rank === 1 ? "6rem" : "4.5rem",
                        color: p.color.border,
                        opacity: 0.12,
                        lineHeight: 1,
                      }}
                    >
                      {p.rank}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          {/* Base platform */}
          <div
            className="h-3 rounded-b-2xl"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
            }}
          />
        </div>

        {/* ── DIVIDER: Plus sign ── */}
        <ScrollReveal delay={200}>
          <div className="flex lg:flex-col items-center gap-3 px-2 transition-transform duration-300 hover:scale-125 cursor-default">
            <div className="h-px w-12 lg:h-12 lg:w-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-border to-transparent" />
            <span
              className="font-display font-black text-4xl text-primary neon-text select-none"
              style={{ textShadow: "0 0 16px hsl(190 100% 50% / 0.6), 0 0 32px hsl(190 100% 50% / 0.3)" }}
            >
              +
            </span>
            <div className="h-px w-12 lg:h-12 lg:w-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>
        </ScrollReveal>

        {/* ── RIGHT: Certificate ── */}
        <ScrollReveal delay={300} className="flex-1 w-full max-w-xs sm:max-w-none mx-auto">
          <div className="flex flex-col items-center gap-5">
            <div className="text-center">
              <p className="font-display font-bold tracking-widest uppercase text-xs text-muted-foreground mb-1">
                Every Participant Gets
              </p>
              <p className="font-display font-black text-2xl text-primary neon-text">
                Certificates
              </p>
            </div>

            {/* Certificate mockup — landscape */}
            <TiltCard>
            <div
              className="w-full rounded-2xl p-[1.5px]"
              style={{
                background: "linear-gradient(135deg, rgba(250,204,21,0.5) 0%, rgba(250,204,21,0.1) 40%, rgba(250,204,21,0.3) 100%)",
              }}
            >
              <div
                className="rounded-2xl relative overflow-hidden flex flex-row min-h-[200px] md:min-h-[280px]"
                style={{ background: "hsl(220 20% 7%)" }}
              >
                {/* Inner border */}
                <div className="absolute inset-3 rounded-xl pointer-events-none"
                  style={{ border: "1px solid rgba(250,204,21,0.15)" }} />

                {/* Corner ornaments */}
                <Corner className="top-5 left-5" />
                <Corner className="top-5 right-5" />
                <Corner className="bottom-5 left-5" />
                <Corner className="bottom-5 right-5" />

                {/* LEFT: Branding + Seal */}
                <div className="flex flex-col items-center justify-center gap-2 md:gap-3 px-3 py-4 md:px-7 md:py-6 relative z-10 min-w-[100px] md:min-w-[140px]">
                  <span className="text-yellow-400/60 text-xs tracking-[0.3em] font-display uppercase mb-1">Clueless</span>
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl"
                    style={{
                      background: "radial-gradient(circle, rgba(250,204,21,0.18), rgba(250,204,21,0.04))",
                      border: "1px solid rgba(250,204,21,0.35)",
                      boxShadow: "0 0 18px rgba(250,204,21,0.25)",
                    }}
                  >
                    🏅
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="w-px self-stretch my-6"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(250,204,21,0.25), transparent)" }} />

                {/* RIGHT: Certificate text */}
                <div className="flex flex-col justify-center flex-1 px-3 py-4 md:px-7 md:py-6 relative z-10">
                  <p className="text-yellow-400/50 tracking-[0.25em] uppercase text-[9px] font-display mb-0.5">
                    Certificate of
                  </p>
                  <h3
                    className="font-display font-black tracking-widest uppercase mb-4"
                    style={{
                      fontSize: "1.1rem",
                      color: "#facc15",
                      textShadow: "0 0 12px rgba(250,204,21,0.4)",
                    }}
                  >
                    Participation
                  </h3>

                  <p className="text-muted-foreground text-xs italic mb-2">This certifies that</p>

                  {/* Name line */}
                  <div className="relative mb-2 md:mb-3 max-w-[160px] md:max-w-[220px]">
                    <p className="font-display text-sm text-foreground/70 tracking-widest">
                      Your Name
                    </p>
                    <div className="mt-1 h-px w-full bg-gradient-to-r from-yellow-400/40 to-transparent" />
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    has successfully participated in{" "}
                    <span className="text-foreground/80 font-medium">Clueless.</span>
                  </p>
                </div>
              </div>
            </div>
            </TiltCard>
          </div>
        </ScrollReveal>

      </div>
    </div>
  </section>
);

export default PrizesSection;
