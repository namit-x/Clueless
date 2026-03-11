"use client";

import { useEffect, useState } from "react";
import GameCard from "./GameCard";

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

export default function GameControlPanel() {

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const activeIndex = games.findIndex(g => g.status === "running");

  async function fetchGames() {
    const res = await fetch("/api/v1/admin/games", {
      credentials: "include",
    });

    const json = await res.json();

    const mapped = json.games.map((g: any) => ({
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
    setLoading(false);
  }

  useEffect(() => {
    fetchGames();
  }, []);

  if (loading) return <div>Loading games...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Game Control</h2>

      {games
        .sort((a, b) => a.order_index - b.order_index)
        .map((game) => (
          <GameCard
            key={game.id}
            game={game}
            refetchGames={fetchGames}
            isStartAllowed={
              activeIndex === -1
                ? game.order_index === 1
                : game.order_index === activeIndex + 2
            }
          />
        ))}
    </div>
  );
}