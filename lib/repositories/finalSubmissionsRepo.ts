import { pool } from "@/lib/db";

export async function getFinalSubmissionRepo(teamId: string) {

    const result = await pool.query(
        `SELECT id, sentence, is_correct, submitted_at, evaluated_at
         FROM final_submissions
         WHERE team_id = $1`,
        [teamId]
    );

    return result.rows[0] ?? null;
}

/**
 * Insert first final submission attempt. evaluated_at is left NULL to indicate
 * the team still has a second attempt available.
 */
export async function insertFinalSubmissionRepo(
    teamId: string,
    sentence: string,
    isCorrect: boolean
) {

    const result = await pool.query(
        `INSERT INTO final_submissions (id, team_id, sentence, is_correct, submitted_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id, sentence, is_correct, submitted_at, evaluated_at`,
        [teamId, sentence, isCorrect]
    );

    return result.rows[0];
}

/**
 * Update for second (final) attempt. Sets evaluated_at to mark that no more
 * attempts remain. Only updates rows where evaluated_at IS NULL (guards
 * against triple-submission).
 * Returns null if no updatable row exists.
 */
export async function updateFinalSubmissionRepo(
    teamId: string,
    sentence: string,
    isCorrect: boolean
) {

    const result = await pool.query(
        `UPDATE final_submissions
         SET sentence = $2,
             is_correct = $3,
             evaluated_at = NOW()
         WHERE team_id = $1
           AND evaluated_at IS NULL
         RETURNING id, sentence, is_correct, submitted_at, evaluated_at`,
        [teamId, sentence, isCorrect]
    );

    return result.rows[0] ?? null;
}
