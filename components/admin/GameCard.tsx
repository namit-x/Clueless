"use client";

import { useState } from "react";

type UIStatus = "pending" | "running" | "paused" | "ended";

type Game = {
  id: string;
  name: string;
  order_index: number;
  status: UIStatus;
  started_at?: string | null;
  paused_at?: string | null;
  resumed_at?: string | null;
  ended_at?: string | null;
};

type Props = {
  game: Game;
  refetchGames: () => Promise<void>;
  isStartAllowed: boolean;   // ⭐ timeline control prop
};

export default function GameCard({
  game,
  refetchGames,
  isStartAllowed,
}: Props) {

  const [loading, setLoading] = useState(false);

  const isPending = game.status === "pending";
  const isRunning = game.status === "running";
  const isPaused = game.status === "paused";
  const isEnded = game.status === "ended";

  const pauseResumeLabel = isRunning ? "Pause" : "Resume";

  async function handleStart() {
    try {
      setLoading(true);

      await fetch(`/api/v1/admin/games/${game.id}/start`, {
        method: "PATCH",
        credentials: "include",
      });

      await refetchGames();

    } finally {
      setLoading(false);
    }
  }

  async function handlePauseResume() {
    try {
      setLoading(true);

      const endpoint = isRunning ? "pause" : "resume";

      await fetch(`/api/v1/admin/games/${game.id}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
      });

      await refetchGames();

    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    try {
      setLoading(true);

      await fetch(`/api/v1/admin/games/${game.id}/end`, {
        method: "PATCH",
        credentials: "include",
      });

      await refetchGames();

    } finally {
      setLoading(false);
    }
  }

  async function handleRestart() {
    try {
      const confirmRestart = confirm(
        "Restarting will reset all team progress. Continue?"
      );

      if (!confirmRestart) return;

      setLoading(true);

      await fetch(`/api/v1/admin/games/${game.id}/restart`, {
        method: "PATCH",
        credentials: "include",
      });

      await refetchGames();

    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`border rounded-xl p-4 flex justify-between items-start ${
        isRunning ? "border-green-500 bg-green-50" : ""
      }`}
    >

      {/* LEFT */}
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">
            {game.order_index}. {game.name}
          </h3>

          {isRunning && (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
              LIVE
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-1">
          Status: {game.status}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">

        <button
          disabled={!isPending || !isStartAllowed || loading}
          onClick={handleStart}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Start
        </button>

        <button
          disabled={!(isRunning || isPaused) || loading}
          onClick={handlePauseResume}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          {pauseResumeLabel}
        </button>

        <button
          disabled={!(isRunning || isPaused) || loading}
          onClick={handleEnd}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          End
        </button>

        <button
          disabled={!isEnded || loading}
          onClick={handleRestart}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Restart
        </button>

      </div>

    </div>
  );
}