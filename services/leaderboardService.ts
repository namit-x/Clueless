import { getLeaderboardTeamsRepo } from "@/repos/leaderboardRepo";
import { computeLeaderboard } from "@/utils/leaderboardUtils";

/**
 * Computes the leaderboard standings from stored team data.
 *
 * @returns The computed leaderboard standings.
 */
export async function getLeaderboardService() {
    const teams = await getLeaderboardTeamsRepo();

    return computeLeaderboard(teams);
}
