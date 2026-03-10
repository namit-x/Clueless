import { pool } from "../db";

export async function getRoundClueRepo(routeId: string, roundNumber: number) {

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