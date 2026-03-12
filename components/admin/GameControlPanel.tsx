"use client";

import { useEffect, useState } from "react";
import GameCard from "./GameCard";
import type { AdminGame } from "@/lib/types/adminGames";

export default function GameControlPanel() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGames() {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/admin/games", {
        credentials: "include",
      });

      const json = await res.json();
      console.log("Fetched games:", json);

      // ⭐ IMPORTANT: backend → UI status mapping
      const mapped: AdminGame[] = (json.games || []).map((g: any) => ({
        ...g,
        status:
          g.status === "NOT_STARTED"
            ? "pending"
            : g.status === "ACTIVE"
            ? "running"
            : g.status === "PAUSED"
            ? "paused"
            : "ended",
      }));

      setGames(mapped);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) return <div>Loading games...</div>;

  // ⭐ currently running or paused game
  const activeGame = games.find(
    (g) => g.status === "running" || g.status === "paused"
  );

  // ⭐ correctly pick highest order ended game
  const lastEndedGame = [...games]
    .filter((g) => g.status === "ended")
    .sort((a, b) => b.order_index - a.order_index)[0];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Game Control</h2>

      {games
        .sort((a, b) => a.order_index - b.order_index)
        .map((game) => {
          let isStartAllowed = false;

          if (activeGame) {
            isStartAllowed = false;
          } else if (!lastEndedGame) {
            isStartAllowed = game.order_index === 1;
          } else {
            isStartAllowed =
              game.order_index === lastEndedGame.order_index + 1;
          }

          return (
            <GameCard
              key={game.id}
              game={game}
              refetchGames={fetchGames}
              isStartAllowed={isStartAllowed}
            />
          );
        })}
    </div>
  );
}