"use client";
import GameCard from "./GameCard";
import { useRouter } from "next/navigation";

type Game = {
  id: string;
  name: string;
  order_index: number;
  state: "NOT_STARTED" | "ACTIVE";
};

type Props = {
  games: Game[];
};

export default function GamesGrid({ games }: Props) {
  const router = useRouter();

  const fetchGame = async (game_id: string) => {
    await fetch(`/api/v1/games/${game_id}/start`, {
      method: "POST",
      credentials: "include",
    });
    router.push(`/games?gameId=${game_id}`);
  };

  if (!games || !Array.isArray(games)) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" />
          </div>
          <p className="text-sm text-white/25 tracking-wide">Loading games...</p>
        </div>
      </div>
    );
  }

  const liveCount = games.filter((g) => g.state === "ACTIVE").length;

  return (
    <div>
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Divider accent */}
          <div className="w-px h-4 bg-primary/40" />
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
            Games
          </h2>
        </div>
        <div>
          {/* Dashboard PlayingGhost */}
        </div>


      </div>

      {/* ── Grid ── */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
        {games.map((game, idx) => (
          <div
            key={game.order_index}
            className="animate-card-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <GameCard
              name={game.name}
              state={game.state}
              onPlay={() => fetchGame(game.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}