type GameState = "COMPLETED" | "ACTIVE" | "LOCKED"

type Props = {
  name: string
  state: GameState
  timeTaken?: number
  rewardWordEarned?: boolean
  onPlay?: () => void
}

export default function GameCard({
  name,
  state,
  timeTaken,
  rewardWordEarned,
  onPlay,
}: Props) {
  return (
    <div
      className={`border rounded-lg p-4 transition 
      ${state === "ACTIVE" ? "border-green-500 shadow-lg" : "border-gray-300"}
      ${state === "LOCKED" ? "opacity-50" : ""}
      `}
    >
      <h2 className="text-lg font-semibold mb-2">{name}</h2>

      {state === "COMPLETED" && (
        <>
          <p className="text-green-600">Completed ✔</p>
          {timeTaken && (
            <p className="text-sm">Time Taken: {timeTaken}s</p>
          )}
          {rewardWordEarned && (
            <p className="text-sm">Reward Word Earned ✔</p>
          )}
        </>
      )}

      {state === "ACTIVE" && (
        <button
          onClick={onPlay}
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
        >
          Play ▶
        </button>
      )}

      {state === "LOCKED" && (
        <p className="text-sm">Complete previous game to unlock 🔒</p>
      )}
    </div>
  )
}