"use client";

import { useState } from "react";
import type { GameStatus } from "./mockData";

export default function GameControlTab() {
  const [status, setStatus] = useState<GameStatus>("Not Started");

  const indicator: Record<
    GameStatus,
    { dot: string; glow: string }
  > = {
    "Not Started": {
      dot: "bg-red-500",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    },
    Running: {
      dot: "bg-[#8fff00]",
      glow: "shadow-[0_0_20px_rgba(143,255,0,0.4)]",
    },
    Ended: {
      dot: "bg-zinc-500",
      glow: "",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="glass w-full max-w-md rounded-2xl p-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          Game Status
        </p>

        <div className="mb-6 flex items-center justify-center gap-3">
          <span
            className={`inline-block h-4 w-4 rounded-full ${indicator[status].dot} ${indicator[status].glow}`}
          />
          <span className="text-2xl font-bold text-foreground">
            {status}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Start */}
          <button
            disabled={status === "Running"}
            onClick={() => setStatus("Running")}
            className="w-full rounded-lg bg-[#8fff00]/90 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#8fff00] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Start Game
          </button>

          {/* End */}
          <button
            disabled={status !== "Running"}
            onClick={() => setStatus("Ended")}
            className="w-full rounded-lg bg-red-500/90 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            End Game
          </button>

          {/* Reset */}
          <button
            onClick={() => setStatus("Not Started")}
            className="w-full rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}