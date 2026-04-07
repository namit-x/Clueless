import { pool } from "@/lib/db";

export async function createTeamGameResult(teamId: string, gameId: string) {
    const query = `
        INSERT INTO team_game_results (
            team_id,
            game_id,
            started_at,
            status
        )
        VALUES ($1, $2, NOW(), 'IN_PROGRESS')
        ON CONFLICT (team_id, game_id) DO NOTHING
        RETURNING
            id,
            team_id,
            game_id,
            started_at,
            completed_at,
            completion_time,
            penalty_seconds,
            status,
            created_at;
    `;

    const result = await pool.query(query, [teamId, gameId]);

    if (result.rowCount && result.rowCount > 0) {
        return result.rows[0];
    }

    return getTeamGameResult(teamId, gameId);
}

export async function getTeamGameResult(teamId: string, gameId: string) {
    const query = `
        SELECT
            id,
            team_id,
            game_id,
            started_at,
            completed_at,
            completion_time,
            penalty_seconds,
            status,
            created_at
        FROM team_game_results
        WHERE team_id = $1
          AND game_id = $2
        LIMIT 1;
    `;

    const result = await pool.query(query, [teamId, gameId]);

    return result.rows[0] ?? null;
}

export async function completeTeamGameResult(teamId: string, gameId: string) {
    const resultQuery = `
        UPDATE team_game_results
        SET
            completed_at = NOW(),
            completion_time = NOW() - started_at,
            status = 'COMPLETED'
        WHERE team_id = $1
          AND game_id = $2
        RETURNING
            id,
            team_id,
            game_id,
            started_at,
            completed_at,
            completion_time,
            penalty_seconds,
            status,
            created_at;
    `;

    const result = await pool.query(resultQuery, [teamId, gameId]);

    return result.rows[0] ?? null;
}

/**
 * Mark all in-progress team game results for a game as timed out and apply a penalty.
 *
 * @param gameId - The game identifier whose in-progress team results should be timed out
 * @param penaltySeconds - The penalty duration, in seconds, to assign to each timed-out result
 * @returns An array of the updated team game result rows, each containing `id`, `team_id`, `game_id`, `started_at`, `completed_at`, `completion_time`, `penalty_seconds`, `status`, and `created_at`
 */
export async function markTimedOutTeamGameResults(gameId: string, penaltySeconds: number) {
    const query = `
        UPDATE team_game_results
        SET
            completed_at = NOW(),
            completion_time = NOW() - started_at,
            penalty_seconds = $2,
            status = 'TIME_OVER'
        WHERE game_id = $1
          AND status = 'IN_PROGRESS'
        RETURNING
            id,
            team_id,
            game_id,
            started_at,
            completed_at,
            completion_time,
            penalty_seconds,
            status,
            created_at;
    `;

    const result = await pool.query(query, [gameId, penaltySeconds]);

    return result.rows;
}

/**
 * Fetches the latest game result for a team, including the game's name.
 *
 * @returns The most recent row containing `game_id`, `status`, and `game_name` for the team, or `null` if no result exists.
 */
export async function getTeamLatestGameResultRepo(teamId: string) {
    const query = `
        SELECT
            tgr.game_id,
            tgr.status,
            g.name AS game_name
        FROM team_game_results tgr
        JOIN games g ON tgr.game_id = g.id
        WHERE tgr.team_id = $1
        ORDER BY tgr.started_at DESC
        LIMIT 1;
    `;

    const result = await pool.query(query, [teamId]);

    return result.rows[0] ?? null;
}

/**
 * Delete all team game result records for a given game.
 *
 * @param gameId - The ID of the game whose team results should be removed from the database
 */
export async function deleteTeamGameResultsByGameId(gameId: string) {
    const query = `
        DELETE FROM team_game_results
        WHERE game_id = $1;
    `;

    await pool.query(query, [gameId]);
}
