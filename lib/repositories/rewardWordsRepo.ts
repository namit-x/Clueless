import { pool } from "@/lib/db";

/**
 * Insert a reward word for a team+game. Idempotent — ON CONFLICT returns existing word.
 */
export async function insertRewardWordRepo(teamId: string, gameId: string, word: string): Promise<string> {

    const result = await pool.query(
        `INSERT INTO reward_words (id, team_id, game_id, word)
         VALUES (gen_random_uuid(), $1, $2, $3)
         ON CONFLICT (team_id, game_id) DO NOTHING
         RETURNING word`,
        [teamId, gameId, word]
    );

    if (result.rowCount && result.rowCount > 0) {
        return result.rows[0].word;
    }

    // Already assigned — fetch existing
    const existing = await pool.query(
        `SELECT word FROM reward_words WHERE team_id = $1 AND game_id = $2`,
        [teamId, gameId]
    );

    return existing.rows[0].word;
}

export async function getRewardWordRepo(teamId: string, gameId: string): Promise<string | null> {

    const result = await pool.query(
        `SELECT word FROM reward_words WHERE team_id = $1 AND game_id = $2`,
        [teamId, gameId]
    );

    return result.rows[0]?.word ?? null;
}
