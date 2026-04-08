import { getLeaderboardTeamsRepo } from "@/repos/leaderboardRepo";
import { computeLeaderboard } from "@/utils/leaderboardUtils";

export async function getLeaderboardService() {
    const teams = await getLeaderboardTeamsRepo();

    return computeLeaderboard(teams);
}
