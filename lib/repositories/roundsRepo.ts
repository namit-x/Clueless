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

export async function getRoundsForGameRepo(gameId: string) {

    const result = await pool.query(
        `SELECT id, round_number
         FROM rounds
         WHERE game_id = $1
         ORDER BY round_number`,
        [gameId]
    );

    return result.rows;
}

export async function getRoundContextRepo(roundId: string) {

    const query = `
    SELECT
      r.id,
      r.game_id,
      r.round_number,
      r.configuration,
      g.name AS game_name
    FROM rounds r
    JOIN games g ON g.id = r.game_id
    WHERE r.id = $1
  `;

    const result = await pool.query(query, [roundId]);

    if (result.rowCount === 0) {
        throw new Error("ROUND_NOT_FOUND");
    }

    return {
        roundId: result.rows[0].id,
        gameId: result.rows[0].game_id,
        roundNumber: result.rows[0].round_number,
        configuration: result.rows[0].configuration,
        gameName: result.rows[0].game_name
    };
}
