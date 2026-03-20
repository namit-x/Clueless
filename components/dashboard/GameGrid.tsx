"use client";
import GameCard from "./GameCard";
import { useRouter } from "next/navigation";

type Game = {
  id: string;
  name: string;
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

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-white/40">
            Available Games
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
        <span className="text-xs text-white/20 tabular-nums">{games.length} total</span>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game, idx) => (
          <div
            key={game.id}
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