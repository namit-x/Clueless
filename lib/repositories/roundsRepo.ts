import { pool } from "@/lib/db";

export async function getRoundNumberRepo(roundId: string) {

    const query = `
    SELECT round_number
    FROM rounds
    WHERE id = $1
  `;

    const result = await pool.query(query, [roundId]);

    if (result.rowCount === 0) {
        throw new Error("ROUND_NOT_FOUND");
    }

    return result.rows[0].round_number;
}