import { pool } from "../db";

export async function insertSubmissionRepo(
    teamId: string,
    roundId: string,
    answer: string,
    isCorrect: boolean
) {

    const query = `
    INSERT INTO submissions (team_id, round_id, submitted_answer, is_correct)
    VALUES ($1,$2,$3,$4)
  `;

    await pool.query(query, [teamId, roundId, answer, isCorrect]);
}