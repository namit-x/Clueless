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

export function computeLeaderboard(teams: Team[]): LeaderboardEntry[] {
    return teams
        .map(toLeaderboardEntry)
        .sort(compareEntries)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
}
