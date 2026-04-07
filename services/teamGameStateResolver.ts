import { getTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import { getCurrentRoundRepo, getActiveOrFailedRoundRepo, areAllRoundsDoneRepo } from "@/lib/repositories/teamRoundProgressRepo";
import type { ResolvedTeamState } from "@/lib/types/teamGameState";

/**
 * Resolve the authoritative game state for a team in a specific game, enforcing priority: COMPLETED > FAILED > TIME_OVER > IN_PROGRESS.
 *
 * The resolver returns a single deterministic state and messageCode that callers should use instead of computing state independently.
 *
 * @returns The authoritative `ResolvedTeamState` for the given team and game (one of `COMPLETED`, `FAILED`, `TIME_OVER`, or `IN_PROGRESS` with the corresponding `messageCode`).
 */
export async function resolveTeamGameState(
  teamId: string,
  gameId: string
): Promise<ResolvedTeamState> {

  const [tgr, activeRound] = await Promise.all([
    getTeamGameResult(teamId, gameId),
    getCurrentRoundRepo(teamId, gameId),
  ]);

  // 1. COMPLETED — highest priority, final
  if (tgr?.status === "COMPLETED") {
    return { teamState: "COMPLETED", messageCode: "GAME_COMPLETED" };
  }

  // 2. No active round → deeper checks
  if (!activeRound) {
    const [failedRound, allDone] = await Promise.all([
      getActiveOrFailedRoundRepo(teamId, gameId),
      areAllRoundsDoneRepo(teamId, gameId),
    ]);

    // FAILED: stuck on a failed round with locked rounds remaining
    if (failedRound?.status === "FAILED" && !allDone) {
      return { teamState: "FAILED", messageCode: "GAME_FAILED" };
    }

    // TIME_OVER: game ended while team was still playing
    if (tgr?.status === "TIME_OVER") {
      return { teamState: "TIME_OVER", messageCode: "GAME_TIME_OVER" };
    }

    // All rounds processed (e.g. Quiz V2 awaiting final submission)
    if (allDone) {
      return { teamState: "IN_PROGRESS", messageCode: "ROUND_COMPLETED" };
    }

    // No rounds active, not failed, not done → game not yet started for team
    return { teamState: "IN_PROGRESS", messageCode: "GAME_IN_PROGRESS" };
  }

  // 3. TIME_OVER even with an active round (admin ended while team was mid-round)
  if (tgr?.status === "TIME_OVER") {
    return { teamState: "TIME_OVER", messageCode: "GAME_TIME_OVER" };
  }

  // 4. Active round exists → playing
  return { teamState: "IN_PROGRESS", messageCode: "ROUND_ACTIVE" };
}
