import { getTeamGameResult } from "@/lib/repositories/teamGameResultsRepo";
import {
  getCurrentRoundRepo,
  getActiveOrFailedRoundRepo,
  areAllRoundsCompletedRepo,
  areAllRoundsTerminalRepo
} from "@/lib/repositories/teamRoundProgressRepo";
import type { ResolvedTeamState } from "@/lib/types/teamGameState";

/**
 * Single source of truth for a team's game state.
 *
 * Priority (strict, no exceptions):
 *   COMPLETED > FAILED > TIME_OVER > IN_PROGRESS
 *
 * - COMPLETED / FAILED are final and must never change.
 * - TIME_OVER only if game ended AND team not finished.
 *
 * Every endpoint that needs to communicate game state to the frontend
 * MUST call this resolver instead of computing state independently.
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
    const [failedRound, allCompleted, allTerminal] = await Promise.all([
      getActiveOrFailedRoundRepo(teamId, gameId),
      areAllRoundsCompletedRepo(teamId, gameId),
      areAllRoundsTerminalRepo(teamId, gameId),
    ]);

    // All rounds completed successfully
    if (allCompleted) {
      return { teamState: "COMPLETED", messageCode: "GAME_COMPLETED" };
    }

    // FAILED: stuck on a failed round with locked rounds remaining
    if (failedRound?.status === "FAILED" && !allTerminal) {
      return { teamState: "FAILED", messageCode: "GAME_FAILED" };
    }

    // TIME_OVER: game ended while team was still playing
    if (tgr?.status === "TIME_OVER") {
      return { teamState: "TIME_OVER", messageCode: "GAME_TIME_OVER" };
    }

    // All rounds terminal, but at least one failed
    if (allTerminal) {
      return { teamState: "FAILED", messageCode: "GAME_FAILED" };
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
