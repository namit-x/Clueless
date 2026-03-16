import { pool } from "../db";

export async function getClueForRoundRepo(routeId: string, roundNumber: number) {

    const query = `
    SELECT clue
    FROM route_locations
    WHERE route_id = $1
    AND round_number = $2
  `;

    const result = await pool.query(query, [routeId, roundNumber]);

    if (result.rowCount === 0) {
        throw new Error("CLUE_NOT_FOUND");
    }

    return result.rows[0].clue;
}

// Alias for backward compatibility (deduped duplicate)
export const getRoundClueRepo = getClueForRoundRepo;

export async function getCorrectAnswerRepo(routeId: string, roundNumber: number) {

    const query = `
    SELECT correct_answer
    FROM route_locations
    WHERE route_id = $1
    AND round_number = $2
  `;

    const result = await pool.query(query, [routeId, roundNumber]);

    if (result.rowCount === 0) {
        throw new Error("ANSWER_NOT_FOUND");
    }

    return result.rows[0].correct_answer;
}

// Combined query to fetch both clue and answer in single DB call
export async function getClueAndAnswerForRoundRepo(routeId: string, roundNumber: number) {

    const query = `
    SELECT clue, correct_answer
    FROM route_locations
    WHERE route_id = $1
    AND round_number = $2
  `;

    const result = await pool.query(query, [routeId, roundNumber]);

    if (result.rowCount === 0) {
        throw new Error("LOCATION_NOT_FOUND");
    }

    return {
        clue: result.rows[0].clue,
        correctAnswer: result.rows[0].correct_answer
    };
}