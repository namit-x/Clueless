export interface LeaderboardEntry {
    teamId: string;
    teamName: string;
    totalTime: number;
    gamesSolved: number;
    rank: number;
}

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

    return sorted.map((e, i) => ({
        ...e,
        rank: i + 1,
    }));
}