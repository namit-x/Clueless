"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import TeamControllerGhost from "../TeamControllerGhost";

type Props = {
  teamName: string;
};

const LetterTilt = ({
  char,
  color,
  delay = 0,
}: {
  char: string;
  color?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const lastRot = useRef(0);
  const [rot, setRot] = useState(0); // starts straight

  useEffect(() => {
    const t1 = setTimeout(() => setRot(-14), delay + 120);
    const t2 = setTimeout(() => setRot(10), delay + 240);
    const t3 = setTimeout(() => setRot(-5), delay + 360);
    const t4 = setTimeout(() => setRot(0), delay + 480);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [delay]);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    const r = ((e.clientX - left) / width - 0.5) * 2 * 22;
    setRot(r);
    lastRot.current = r;
  };

  const onLeave = () => {
    setRot(-lastRot.current * 0.55);
    setTimeout(() => setRot(0), 220);
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={color ?? "text-white/80"}
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

const CLUE = ["C", "l", "u", "e"];
const LESS = ["L", "e", "s", "s"];



/**
 * Render the dashboard header containing a per-letter tilt wordmark, a typed display of the provided team name, and a logout control.
 *
 * The component types the `teamName` one character at a time, manages logout (clears user state and navigates to root), and includes a decorative team controller graphic.
 *
 * @param teamName - The team name to reveal in the header
 * @returns The header JSX element
 */
export default function DashboardHeader({ teamName }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [typedName, setTypedName] = useState("");


  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    dispatch(clearUser());
    localStorage.removeItem("user");
    router.push("/");
  };
  useEffect(() => {
    let index = 0;
    setTypedName("");

    const interval = setInterval(() => {
      if (index < teamName.length) {
        setTypedName(teamName.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80); // typing speed

    return () => clearInterval(interval);
  }, [teamName]);

  return (
    <div className="mb-8">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
        {/* Logo wordmark with per-letter tilt */}
        <button
          onClick={() => router.push("/")}
          className="font-display text-xl sm:text-2xl font-bold text-primary tracking-wider neon-text select-none"
          style={{ lineHeight: 1 }}
        >
          {[...CLUE, ...LESS].map((char, i) => (
            <LetterTilt
              key={i}
              char={char}
              color="text-primary"
              delay={i * 80}
            />
          ))}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="
            group flex items-center gap-2 px-3.5 py-2 rounded-lg
            bg-red-500/[0.06] border border-red-500/[0.1]
            text-red-400/50 text-xs font-medium tracking-wide uppercase
            transition-all duration-200
            hover:bg-red-500/[0.12] hover:border-red-500/[0.2] hover:text-red-400/80
            active:scale-[0.97] active:duration-100
          "
        >
          Logout
          <svg
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>

      {/* ── Hero zone ── */}
      <div className="flex items-center justify-between gap-6">        <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium mb-2">
          Welcome back
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white/90 tracking-tight leading-none">
          {typedName}
          <span className="animate-pulse"></span>
        </h1>
      </div>

        {/* PlayingGhost*/}
        <div className="group shrink-0 w-[100px] h-[90px] flex items-center justify-center overflow-hidden cursor-pointer">
          <TeamControllerGhost className="scale-[0.62] origin-center transition-all duration-300 group-hover:scale-[0.68] " />
        </div>
      </div>
    </div>
  );
}