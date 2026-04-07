export type Team = {
    teamId: string;
    teamName: string;
    games: {
        teamGameResultId: string;
        gameId: string;
        gameName: string;
        time: number;
        penaltySeconds: number;
        status: string;
        isCorrect: boolean;
    }[];
};

export type LeaderboardEntry = {
    teamId: string;
    teamName: string;
    totalTime: number;
    gamesSolved: number;
    rank: number;
    games: Team["games"];
};

/**
 * Builds a leaderboard entry (without `rank`) for a team by aggregating its game results.
 *
 * @param team - Team whose game results will be aggregated into a leaderboard entry
 * @returns An object containing `teamId`, `teamName`, `totalTime` (sum of all game `time` values), `gamesSolved` (count of games with `isCorrect === true`), and the original `games` array
 */
function toLeaderboardEntry(team: Team): Omit<LeaderboardEntry, "rank"> {
    const totalTime = team.games.reduce((sum, game) => sum + game.time, 0);
    const gamesSolved = team.games.reduce(
        (count, game) => count + (game.isCorrect ? 1 : 0),
        0
    );

    return {
        teamId: team.teamId,
        teamName: team.teamName,
        totalTime,
        gamesSolved,
        games: team.games,
    };
}

/**
 * Determine ordering between two leaderboard entries by games solved, total time, then teamId.
 *
 * @param left - The first leaderboard entry to compare
 * @param right - The second leaderboard entry to compare
 * @returns A negative number if `left` should come before `right`, a positive number if `left` should come after `right`, or `0` if they are equivalent
 */
function compareEntries(
    left: Omit<LeaderboardEntry, "rank">,
    right: Omit<LeaderboardEntry, "rank">
) {
    if (left.gamesSolved !== right.gamesSolved) {
        return right.gamesSolved - left.gamesSolved;
    }

    if (left.totalTime !== right.totalTime) {
        return left.totalTime - right.totalTime;
    }

    if (left.teamId < right.teamId) {
        return -1;
    }

    if (left.teamId > right.teamId) {
        return 1;
    }

    return 0;
}

/**
 * Generate a ranked leaderboard from an array of teams.
 *
 * @param teams - The teams to include in the leaderboard
 * @returns The top 20 leaderboard entries, each augmented with a `rank` starting at 1. Entries are sorted by: higher `gamesSolved` first, lower `totalTime` next, then `teamId` lexicographically as a final tie-breaker.
 */
export function computeLeaderboard(teams: Team[]): LeaderboardEntry[] {
    return teams
        .map(toLeaderboardEntry)
        .sort(compareEntries)
        .slice(0, 20)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
}
