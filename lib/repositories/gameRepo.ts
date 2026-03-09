import { pool } from "@/lib/db";

export async function getGameByIdRepo(gameId: string) {
    const query = `
    SELECT id, status
    FROM games
    WHERE id = $1;
  `;

    const result = await pool.query(query, [gameId]);

    if (result.rowCount === 0) {
        throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];
}

export async function activateGameRepo(gameId: string) {
    const query = `
    UPDATE games
    SET status = 'ACTIVE', started_at = NOW()
    WHERE id = $1
    RETURNING id, status;
  `;

    const result = await pool.query(query, [gameId]);

    return result.rows[0];
}

export async function endGameRepo(gameId: string) {

  const query = `
    UPDATE games
    SET status = 'ENDED',
        ended_at = NOW()
    WHERE id = $1
    RETURNING id, status, ended_at;
  `;

  try {

    const result = await pool.query(query, [gameId]);

    if (result.rowCount === 0) {
      throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];

  } catch (error: any) {
    throw new Error(`DB_END_GAME_FAILED: ${error.message}`);
  }
}