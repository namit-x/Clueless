import GameCard from "./GameCard"

type Game = {
  id: number
  name: string
  state: "COMPLETED" | "ACTIVE" | "LOCKED"
  time_taken_seconds?: number
  reward_word_earned?: boolean
}

type Props = {
  games: Game[]
}

export default function GamesGrid({ games }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {games.map((game) => (
        <GameCard
          key={game.id}
          name={game.name}
          state={game.state}
          timeTaken={game.time_taken_seconds}
          rewardWordEarned={game.reward_word_earned}
          onPlay={() => {
            if (game.state === "ACTIVE") {
              window.location.href = "/games"
            }
          }}
        />
      ))}
    </div>
  )
}