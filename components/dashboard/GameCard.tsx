type GameState = "NOT_STARTED" | "ACTIVE" | "PAUSED" | "ENDED";

type Props = {
  name: string
  state: GameState
  // timeTaken?: number
  // rewardWordEarned?: boolean
  onPlay?: () => void
}

export default function GameCard({
  name,
  state,
  // timeTaken,
  // rewardWordEarned,
  onPlay,
}: Props) {
  return (
    <div
      className={`border rounded-lg p-4 transition 
      ${state === "ACTIVE" ? "border-green-500 shadow-lg" : "border-gray-300"}
      ${state === "NOT_STARTED" ? "opacity-50" : ""}
      `}
    >
      <h2 className="text-lg font-semibold mb-2">{name}</h2>

      {state === "ENDED" && (
        <>
          <p className="text-sm">Game have ended</p>
            {/* <p className="text-green-600">Completed ✔</p> */}
            <p className="text-sm">Time Taken: __s</p>
            <p className="text-sm">Reward Word Earned ✔</p>
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

      {state === "PAUSED" && (
        <p className="text-yellow-600">Game Paused ⏸</p>
      )}

      {state === "NOT_STARTED" && (
        <p className="text-sm">Game not started</p>
      )}
    </div>
  )
}