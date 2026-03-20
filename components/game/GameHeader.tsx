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
      className="w-full flex items-center justify-center px-6 py-4 shrink-0 relative glass-strong"
    >
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute left-6 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors duration-200 active:scale-[0.97]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        back
      </button>

      <span
        className="font-display text-sm tracking-[0.3em] uppercase font-medium text-foreground/90"
      >
        {gName}
      </span>
    </div>
  );
}