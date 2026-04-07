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

/**
 * Fetches all teams from the database ordered by `team_id` ascending.
 *
 * @returns An array of rows, each containing `team_id` and `team_name`.
 */
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

/**
 * Retrieves team game result records augmented with game names and a computed total time.
 *
 * The returned rows include each result's id, team_id, game_id, game_name, a computed `time`
 * (completion time in epoch seconds plus penalty seconds, with nulls treated as zero),
 * `penalty_seconds` (defaulting to 0 when null), and `status`. Results are ordered by
 * `team_id` then `game_id` ascending.
 *
 * @returns An array of `TeamGameResultRow` objects containing the selected and computed fields
 * for each team game result.
 */
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

/**
 * Fetches aggregated submission correctness for each team and game.
 *
 * Rows are grouped by `team_id` and `game_id`; `is_correct` is `true` if any submission
 * by the team for that game is correct, `false` otherwise.
 *
 * @returns An array of rows containing `team_id`, `game_id`, and aggregated `is_correct`
 */
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

/**
 * Builds a lookup of whether each team solved each game.
 *
 * @param submissions - Aggregated submission rows grouped by team and game; `is_correct` is `true` if any submission in the group was correct
 * @returns A Map keyed by `"{team_id}:{game_id}"` with a boolean value that is `true` if the team has a correct submission for that game, `false` otherwise
 */
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

/**
 * Group team game result rows into a map keyed by team ID, producing each team's array of game entries.
 *
 * @param teamGameResults - Rows describing team game results and associated game metadata
 * @param correctnessMap - Map keyed by `"{team_id}:{game_id}"` to a boolean indicating whether that team has a correct submission for the game
 * @returns A Map whose keys are `team_id` strings and whose values are arrays of entries compatible with `Team["games"]`, with each entry annotated with `isCorrect`
 */
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

/**
 * Convert raw database rows into leaderboard-ready Team objects with their games.
 *
 * @param teams - Rows from the `teams` table containing `team_id` and `team_name`
 * @param teamGameResults - Rows describing each team's game result (includes `team_id`, `game_id`, `game_name`, `time`, `penalty_seconds`, `status`, and `id`)
 * @param submissions - Aggregated per-team-per-game correctness rows (`team_id`, `game_id`, aggregated `is_correct`)
 * @returns An array of `Team` objects where each entry has `teamId`, `teamName`, and a `games` array populated from the provided results; `games` is an empty array if the team has no results
 */
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

/**
 * Assembles leaderboard-ready Team records by fetching teams, team game results, and submissions.
 *
 * @returns An array of `Team` objects where each contains `teamId`, `teamName`, and a `games` list (empty if the team has no game results)
 */
export async function getLeaderboardTeamsRepo(): Promise<Team[]> {
    const [teams, teamGameResults, submissions] = await Promise.all([
        fetchTeams(),
        fetchTeamGameResults(),
        fetchSubmissions(),
    ]);

    return toTeams(teams, teamGameResults, submissions);
}
