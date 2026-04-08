"use client";

import { useEffect, useRef } from "react";

type CoderGhostProps = {
  isTyping: boolean;
  className?: string;
};

export default function CoderGhost({
  isTyping,
  className = "",
}: CoderGhostProps) {
  const animRef = useRef<number | null>(null);
  const bounceRef = useRef(0);
  const cursorRef = useRef(0);

  const eyeRef = useRef({
    lx: 84,
    ly: 84,
    rx: 116,
    ry: 84,
  });

  const pupilLRef = useRef<SVGCircleElement>(null);
  const pupilRRef = useRef<SVGCircleElement>(null);
  const armLRef = useRef<SVGPathElement>(null);
  const armRRef = useRef<SVGPathElement>(null);
  const cursorBlockRef = useRef<SVGRectElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);

  const idleEye = { lx: 81, ly: 80, rx: 113, ry: 80 };
  const typingEye = { lx: 85, ly: 88, rx: 117, ry: 88 };

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      animRef.current = requestAnimationFrame(loop);

      bounceRef.current += 0.1;
      cursorRef.current += 0.05;

      // 👀 Eye movement
      const target = isTyping ? typingEye : idleEye;
      const eye = eyeRef.current;

      eye.lx = lerp(eye.lx, target.lx, 0.1);
      eye.ly = lerp(eye.ly, target.ly, 0.1);
      eye.rx = lerp(eye.rx, target.rx, 0.1);
      eye.ry = lerp(eye.ry, target.ry, 0.1);

      pupilLRef.current?.setAttribute("cx", eye.lx.toFixed(1));
      pupilLRef.current?.setAttribute("cy", eye.ly.toFixed(1));
      pupilRRef.current?.setAttribute("cx", eye.rx.toFixed(1));
      pupilRRef.current?.setAttribute("cy", eye.ry.toFixed(1));

      // 💻 cursor blink
      if (cursorBlockRef.current) {
        cursorBlockRef.current.setAttribute(
          "opacity",
          Math.sin(cursorRef.current * 3) > 0 ? "1" : "0.1"
        );
      }

      // 🙂 mouth reaction
      mouthRef.current?.setAttribute(
        "d",
        isTyping
          ? "M89 106 Q100 115 111 106"
          : "M91 106 Q100 112 109 106"
      );

      // ⌨️ hands typing
      if (isTyping) {
        const wave = Math.sin(bounceRef.current * 5);

        const lHandY = 157 + wave * 5;
        const rHandY = 157 - wave * 5;

        armLRef.current?.setAttribute(
          "d",
          `M68 122 C64 136 66 148 72 ${lHandY.toFixed(1)}`
        );

        armRRef.current?.setAttribute(
          "d",
          `M132 122 C136 136 134 148 128 ${rHandY.toFixed(1)}`
        );
      } else {
        armLRef.current?.setAttribute(
          "d",
          "M68 122 C58 132 50 140 52 150"
        );
        armRRef.current?.setAttribute(
          "d",
          "M132 122 C142 132 150 140 148 150"
        );
      }
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isTyping]);

  return (
    <div className={`inline-block ${className}`}>
      <svg viewBox="0 0 200 220" width="56" height="62" overflow="visible">
        <defs>
          <filter id="cg-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="5"
              floodColor="rgba(134,239,172,0.45)"
            />
          </filter>
        </defs>

        {/* Ghost */}
        <path
          d="M42 95C42 52 66 30 100 30s58 22 58 65v54l-15-11-14 11-15-11-14 11-15-11-14 11V95Z"
          fill="#86efac"
          filter="url(#cg-glow)"
        />

        {/* Eyes */}
        <ellipse cx="84" cy="84" rx="9" ry="11" fill="white" />
        <ellipse cx="116" cy="84" rx="9" ry="11" fill="white" />
        <circle ref={pupilLRef} cx="84" cy="84" r="4.5" fill="#111" />
        <circle ref={pupilRRef} cx="116" cy="84" r="4.5" fill="#111" />

        {/* Mouth */}
        <path
          ref={mouthRef}
          d="M91 106 Q100 112 109 106"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arms */}
        <path
          ref={armLRef}
          d="M68 122 C58 132 50 140 52 150"
          stroke="#86efac"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={armRRef}
          d="M132 122 C142 132 150 140 148 150"
          stroke="#86efac"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Laptop */}
        <rect x="44" y="160" width="112" height="42" rx="10" fill="#1e293b" />
        <rect x="54" y="166" width="92" height="26" rx="5" fill="#0f172a" />

        {/* Code lines */}
        <rect
          ref={cursorBlockRef}
          x="58"
          y="170"
          width="5"
          height="8"
          rx="1"
          fill="#86efac"
        />
        <rect x="67" y="171" width="28" height="2.5" rx="1.2" fill="#4ade80" opacity="0.5" />
        <rect x="67" y="176" width="18" height="2.5" rx="1.2" fill="#4ade80" opacity="0.3" />
        <rect x="67" y="181" width="36" height="2.5" rx="1.2" fill="#4ade80" opacity="0.4" />
      </svg>
    </div>
  );
}