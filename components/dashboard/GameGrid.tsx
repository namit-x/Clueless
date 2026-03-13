'use client';
import GameCard from "./GameCard"
import {useRouter} from "next/navigation";


type Game = {
  id: string;
  name: string;
  state: "NOT_STARTED" | "ACTIVE" | "PAUSED" | "ENDED";
//   time_taken_seconds?: number
//   reward_word_earned?: boolean
}

type Props = {
  games: Game[]
}

export default function GamesGrid({ games }: Props) {
  const router = useRouter();

  if (!games || !Array.isArray(games)) {
    return <div className="text-center py-8">Loading games...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {games.map((game) => (
        <GameCard
          key={game.id}
          name={game.name}
          state={game.state}
          // timeTaken={game.time_taken_seconds}
          // rewardWordEarned={game.reward_word_earned}
          onPlay={() => {
            if (game.state === "ACTIVE") {
              router.push("/games");
            }
          }}
        />
      ))}
    </div>
  )
}