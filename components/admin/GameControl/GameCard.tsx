"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  startAdminGameThunk,
  pauseAdminGameThunk,
  resumeAdminGameThunk,
  endAdminGameThunk,
  restartAdminGameThunk,
} from "@/store/slices/adminGamesSlice";
import type { AdminGame } from "@/lib/types/adminGames";

type Props = {
  game: AdminGame;
  isStartAllowed: boolean;
};

export default function GameCard({ game, isStartAllowed }: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const canStart = game.status === "pending" && isStartAllowed;
  const canPause = game.status === "running";
  const canResume = game.status === "paused";
  const canEnd = canPause || canResume;
  const canRestart = game.status === "ended";

  const pauseResumeLabel = canPause ? "Pause" : "Resume";

  async function handleAction(thunk: any) {
    try {
      setLoading(true);
      await dispatch(thunk(game.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`border rounded-xl p-4 flex justify-between ${
        game.status === "running" ? "border-green-500"
        : game.status === "paused" ? "border-yellow-500"
        : game.status === "ended" ? "border-red-500"
        : ""
      }`}
    >
      {/* LEFT */}
      <div>
        <h3 className="font-semibold">
          {game.order_index}. {game.name}
        </h3>
        <p className="text-sm text-gray-500">{game.status}</p>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">
        <button
          disabled={!canStart || loading}
          onClick={() => handleAction(startAdminGameThunk)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Start
        </button>

        <button
          disabled={!(canPause || canResume) || loading}
          onClick={() => handleAction(canPause ? pauseAdminGameThunk : resumeAdminGameThunk)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          {pauseResumeLabel}
        </button>

        <button
          disabled={!canEnd || loading}
          onClick={() => handleAction(endAdminGameThunk)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          End
        </button>

        <button
          disabled={!canRestart || loading}
          onClick={() => handleAction(restartAdminGameThunk)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Restart
        </button>
      </div>
    </div>
  );
}