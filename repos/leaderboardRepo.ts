import { pool } from "@/lib/db";
import type { Team } from "@/utils/leaderboardUtils";

type TeamRow = {
    team_id: string;
    team_name: string;
};

type TeamGameResultRow = {
    id: string;
    team_id: string;
    game_id: string;
    game_name: string;
    time: number;
    penalty_seconds: number;
    status: string;
};

async function fetchTeams(): Promise<TeamRow[]> {
    const result = await pool.query<TeamRow>(`
        SELECT
            team_id,
            team_name
        FROM teams
        ORDER BY team_id ASC;
    `);

    return result.rows;
}

async function fetchTeamGameResults(): Promise<TeamGameResultRow[]> {
    const result = await pool.query<TeamGameResultRow>(`
        SELECT
            tgr.id,
            team_id,
            tgr.game_id,
            g.name AS game_name,
            (
                COALESCE(EXTRACT(EPOCH FROM tgr.completion_time), 0)::integer
                + COALESCE(tgr.penalty_seconds, 0)
            ) AS time,
            COALESCE(tgr.penalty_seconds, 0) AS penalty_seconds,
            tgr.status
        FROM team_game_results tgr
        JOIN games g ON g.id = tgr.game_id
        ORDER BY team_id ASC, tgr.game_id ASC;
    `);

    return result.rows;
}

function buildGamesByTeam(teamGameResults: TeamGameResultRow[]) {
    const gamesByTeam = new Map<string, Team["games"]>();

    for (const result of teamGameResults) {
        const teamGames = gamesByTeam.get(result.team_id) ?? [];

        teamGames.push({
            teamGameResultId: result.id,
            gameId: result.game_id,
            gameName: result.game_name,
            time: result.time,
            penaltySeconds: result.penalty_seconds,
            status: result.status,
            isCorrect: result.status === "COMPLETED",
        });

        gamesByTeam.set(result.team_id, teamGames);
    }

    return gamesByTeam;
}

function toTeams(
    teams: TeamRow[],
    teamGameResults: TeamGameResultRow[]
): Team[] {
    const gamesByTeam = buildGamesByTeam(teamGameResults);

    return teams.map((team) => ({
        teamId: team.team_id,
        teamName: team.team_name,
        games: gamesByTeam.get(team.team_id) ?? [],
    }));
}

export async function getLeaderboardTeamsRepo(): Promise<Team[]> {
    const [teams, teamGameResults] = await Promise.all([
        fetchTeams(),
        fetchTeamGameResults(),
    ]);

    return toTeams(teams, teamGameResults);
}
