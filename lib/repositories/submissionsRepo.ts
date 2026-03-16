import { pool } from "../db";

export async function insertSubmissionRepo(
    teamId: string,
    roundId: string,
    answer: string,
    isCorrect: boolean,
    evaluationResult: string
) {

    const query = `
        INSERT INTO submissions 
        (team_id, round_id, submitted_answer, is_correct, evaluation_result, evaluated_at)
        VALUES ($1,$2,$3,$4,$5,NOW())
    `;

    await pool.query(query, [
        teamId,
        roundId,
        answer,
        isCorrect,
        evaluationResult
    ]);
}