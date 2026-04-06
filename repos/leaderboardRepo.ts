import { pool } from "@/lib/db";
import type { Team } from "@/utils/leaderboardUtils";

type TeamRow = {
    team_id: string;
    team_name: string;
};

type TeamGameResultRow = {
    team_id: string;
    game_id: string;
    time: number;
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
            team_id,
            game_id,
            (
                COALESCE(EXTRACT(EPOCH FROM completion_time), 0)::integer
                + COALESCE(penalty_seconds, 0)
            ) AS time
        FROM team_game_results
        ORDER BY team_id ASC, game_id ASC;
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
    const gamesByTeam = new Map<
        string,
        {
            time: number;
            isCorrect: boolean;
        }[]
    >();

    for (const result of teamGameResults) {
        const teamGames = gamesByTeam.get(result.team_id) ?? [];

        teamGames.push({
            time: result.time,
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
