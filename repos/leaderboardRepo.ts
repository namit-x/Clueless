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

type SubmissionRow = {
    team_id: string;
    game_id: string;
    is_correct: boolean;
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

async function fetchSubmissions(): Promise<SubmissionRow[]> {
    const result = await pool.query<SubmissionRow>(`
        SELECT
            s.team_id,
            r.game_id,
            BOOL_OR(s.is_correct) AS is_correct
        FROM submissions s
        JOIN rounds r ON r.id = s.round_id
        GROUP BY s.team_id, r.game_id
        ORDER BY s.team_id ASC, r.game_id ASC;
    `);

    return result.rows;
}

function buildCorrectnessMap(submissions: SubmissionRow[]) {
    const correctnessMap = new Map<string, boolean>();

    for (const submission of submissions) {
        correctnessMap.set(
            `${submission.team_id}:${submission.game_id}`,
            submission.is_correct
        );
    }

    return correctnessMap;
}

function buildGamesByTeam(
    teamGameResults: TeamGameResultRow[],
    correctnessMap: Map<string, boolean>
) {
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
            isCorrect: correctnessMap.get(`${result.team_id}:${result.game_id}`) ?? false,
        });

        gamesByTeam.set(result.team_id, teamGames);
    }

    return gamesByTeam;
}

function toTeams(
    teams: TeamRow[],
    teamGameResults: TeamGameResultRow[],
    submissions: SubmissionRow[]
): Team[] {
    const correctnessMap = buildCorrectnessMap(submissions);
    const gamesByTeam = buildGamesByTeam(teamGameResults, correctnessMap);

    return teams.map((team) => ({
        teamId: team.team_id,
        teamName: team.team_name,
        games: gamesByTeam.get(team.team_id) ?? [],
    }));
}

export async function getLeaderboardTeamsRepo(): Promise<Team[]> {
    const [teams, teamGameResults, submissions] = await Promise.all([
        fetchTeams(),
        fetchTeamGameResults(),
        fetchSubmissions(),
    ]);

    return toTeams(teams, teamGameResults, submissions);
}
