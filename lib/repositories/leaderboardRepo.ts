export interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    totalTime: number;
    gamesSolved: number;
    rank: number;
}

/**
 * Produce up to 20 leaderboard entries for the provided teams, ranked by performance.
 *
 * Teams are ordered first by number of solved games (descending), then by total time (ascending), and finally by `teamId` (lexicographic) as a deterministic tie-breaker. Each returned entry includes computed `totalTime`, `gamesSolved`, and a 1-based `rank`.
 *
 * @param teams - Array of team records; each must include `teamId`, `teamName`, and `games` where each game has `time` (number) and `isCorrect` (boolean).
 * @returns An array of up to 20 `LeaderboardEntry` objects sorted and assigned ranks according to the rules above.
 */
export function computeLeaderboard(teams: {
    teamId: string;
    teamName: string;
    games: { time: number; isCorrect: boolean }[];
}[]): LeaderboardEntry[] {
    const entries = teams.map((team) => {
        let totalTime = 0;
        let gamesSolved = 0;

        for (const game of team.games) {
            totalTime += game.time;
            if (game.isCorrect) gamesSolved++;
        }

        return {
            teamId: team.teamId,
            teamName: team.teamName,
            totalTime,
            gamesSolved,
            rank: 0,
        };
    });

    const sorted = entries.sort((a, b) => {
        // 1. correctness priority
        if (a.gamesSolved !== b.gamesSolved) {
            return b.gamesSolved - a.gamesSolved;
        }

        // 2. total time
        if (a.totalTime !== b.totalTime) {
            return a.totalTime - b.totalTime;
        }

        // 3. stable tie-break
        return a.teamId.localeCompare(b.teamId);
    });

    return sorted.slice(0, 20).map((e, i) => ({
        ...e,
        rank: i + 1,
    }));
}