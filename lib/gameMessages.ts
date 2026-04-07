import type { MessageCode } from "@/lib/types/teamGameState";

/**
 * Deterministic mapping from messageCode → display string.
 *
 * Frontend must ONLY use this mapping for game state messaging.
 * No logic based on game.status or round.status.
 */
export const GAME_MESSAGE_MAP: Record<MessageCode, string> = {
  GAME_COMPLETED: "Game completed. Well played!",
  GAME_FAILED: "Attempts exhausted — your run ends here.",
  GAME_TIME_OVER: "Time's up! The game has been ended.",
  GAME_IN_PROGRESS: "Waiting for game to start...",
  ROUND_ACTIVE: "",
  ROUND_COMPLETED: "All rounds completed.",
};

/**
 * Derive which UI screen to show from messageCode.
 *
 * "playing"          → show the round UI
 * "finished"         → game completed screen
 * "failed"           → failure screen
 * "time_over"        → time-over screen
 * "rounds_done"      → all rounds done (game-specific, e.g. Quiz V2 final phase)
 * "waiting"          → waiting/lobby screen
 */
export type GameScreen = "playing" | "finished" | "failed" | "time_over" | "rounds_done" | "waiting";

/**
 * Map an optional `MessageCode` to the UI game screen identifier.
 *
 * @param messageCode - The message code to map; may be `undefined`.
 * @returns The corresponding `GameScreen`: `finished` for `GAME_COMPLETED`, `failed` for `GAME_FAILED`, `time_over` for `GAME_TIME_OVER`, `playing` for `ROUND_ACTIVE`, `rounds_done` for `ROUND_COMPLETED`, or `waiting` for `GAME_IN_PROGRESS`. Returns `waiting` when `messageCode` is `undefined` or unrecognized.
 */
export function getGameScreen(messageCode: MessageCode | undefined): GameScreen {
  switch (messageCode) {
    case "GAME_COMPLETED":
      return "finished";
    case "GAME_FAILED":
      return "failed";
    case "GAME_TIME_OVER":
      return "time_over";
    case "ROUND_ACTIVE":
      return "playing";
    case "ROUND_COMPLETED":
      return "rounds_done";
    case "GAME_IN_PROGRESS":
      return "waiting";
    default:
      return "waiting";
  }
}
