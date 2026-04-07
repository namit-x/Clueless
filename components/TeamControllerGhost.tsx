"use client";

import { useEffect, useRef, useState } from "react";

type TeamControllerGhostProps = {
  className?: string;
};

/**
 * Renders an inline SVG "ghost" graphic whose pupils follow the mouse cursor.
 *
 * The component tracks global mouse movement while mounted and updates the pupils' positions
 * relative to the component's center; the mouse listener is removed on unmount.
 *
 * @param className - Optional additional class names applied to the wrapper element
 * @returns A React element containing the ghost SVG with animated pupils
 */
export default function TeamControllerGhost({ className = "" }: TeamControllerGhostProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.min(6, Math.sqrt(dx * dx + dy * dy) / 60);

      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <div className="relative">
        <svg
          className="w-[130px] h-[130px] lg:w-[180px] lg:h-[180px] overflow-visible"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <filter id="ghostGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="rgba(34,211,238,0.55)" />
            </filter>
          </defs>

          <path
            d="M45 92C45 50 69 28 100 28s55 22 55 64v52l-14-10-14 10-14-10-13 10-14-10-14 10V92Z"
            className="fill-cyan-400/90"
            filter="url(#ghostGlow)"
          />

          <ellipse cx="85" cy="85" rx="9" ry="12" fill="white" />
          <ellipse cx="115" cy="85" rx="9" ry="12" fill="white" />

          <g>
            <circle cx={87 + eyeOffset.x} cy={87 + eyeOffset.y} r="4.2"
              fill="#111" />
            <circle cx={117 + eyeOffset.x} cy={87 + eyeOffset.y} r="4.2"
              fill="#111" />
          </g>

          <path
            d="M90 108C96 111 106 114 112 106"
            stroke="#0f172a"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M62 118C52 124 46 130 58 140"
            stroke="rgb(34 211 238)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M138 118C148 124 154 130 142 140"
            stroke="rgb(34 211 238)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <g>
            <rect x="58" y="132" width="84" height="34" rx="16" className="fill-slate-900" />
            <circle cx="78" cy="149" r="4" className="fill-cyan-300" />
            <circle cx="122" cy="144" r="3" className="fill-cyan-300" />
            <circle cx="132" cy="149" r="3" className="fill-cyan-300" />
            <circle cx="122" cy="154" r="3" className="fill-cyan-300" />
            <circle cx="112" cy="149" r="3" className="fill-cyan-300" />
            <rect x="73" y="145" width="10" height="3" rx="1.5" fill="white" />
            <rect x="76.5" y="141.5" width="3" height="10" rx="1.5" fill="white" />
          </g>
        </svg>
      </div>
    </div>
  );
}
