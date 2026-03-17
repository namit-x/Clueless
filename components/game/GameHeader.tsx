import { useEffect } from "react";
import { useRouter } from "next/navigation";

type GameHeaderProps = {
  gName: string
  // teamName: string
}

export default function GameHeader({  gName}: GameHeaderProps) {
  const router = useRouter();


  // useEffect(() => {
  //   async function fetchCurrentGame() { 
  //     const res = await fetch("/api/v1/games/current/round", {
  //       credentials: "include",
  //     });

  //     const json = await res.json();
  //     console.log("Current Round data:", json);
  //   }

  //   // 

  //   fetchCurrentGame();
  // }, []);
  
  return (
    <div
      className="w-full flex items-center justify-center px-6 py-4 shrink-0 relative"
      style={{ background: "#0a0a0a", borderBottom: "0.5px solid #1f1f1f" }}
    >
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute left-6 flex items-center gap-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        style={{ color: "#e0e0e0", fontFamily: "var(--font-mono)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        back
      </button>

      <span
        className="text-sm tracking-[0.3em] uppercase font-medium"
        style={{ color: "#e0e0e0", fontFamily: "'Geist Mono', 'JetBrains Mono', 'Courier New', monospace" }}
      >
        {gName}
      </span>
    </div>
  );
}