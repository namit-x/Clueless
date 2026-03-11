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
    SET
      is_active = true,
      status = 'LIVE',
      started_at = NOW()
    WHERE id = $1
    RETURNING id, status, is_active, started_at;
  `;

  try {

    const result = await pool.query(query, [gameId]);

    if (result.rowCount === 0) {
      throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];

  } catch (error: any) {
    throw new Error(`DB_ACTIVATE_GAME_FAILED: ${error.message}`);
  }
}

export async function endGameRepo(gameId: string) {

  const query = `
    UPDATE games
    SET
      is_active = false,
      status = 'ENDED',
      ended_at = NOW()
    WHERE id = $1
    RETURNING id, status, is_active, ended_at;
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

export async function pauseGameRepo(gameId: string) {

  const query = `
    UPDATE games
    SET
      status = 'PAUSED',
      paused_at = NOW()
    WHERE id = $1
    RETURNING id, status, is_active, paused_at;
  `;

  try {

    const result = await pool.query(query, [gameId]);

    if (result.rowCount === 0) {
      throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];

  } catch (error: any) {
    throw new Error(`DB_PAUSE_GAME_FAILED: ${error.message}`);
  }
}

export async function resumeGameRepo(gameId: string) {

  const query = `
    UPDATE games
    SET
      status = 'LIVE',
      resumed_at = NOW()
    WHERE id = $1
    RETURNING id, status, is_active, resumed_at;
  `;

  try {

    const result = await pool.query(query, [gameId]);

    if (result.rowCount === 0) {
      throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];

  } catch (error: any) {
    throw new Error(`DB_RESUME_GAME_FAILED: ${error.message}`);
  }
}

export async function restartGameRepo(gameId: string) {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    await client.query(`DELETE FROM team_routes`);
    await client.query(`DELETE FROM team_round_progress`);
    await client.query(`DELETE FROM submissions`);
    await client.query(`DELETE FROM reward_words`);
    await client.query(`DELETE FROM final_submissions`);

    const result = await client.query(`
      UPDATE games
      SET status = 'NOT_STARTED',
          started_at = NULL,
          ended_at = NULL
      WHERE id = $1
      RETURNING id, status;
    `, [gameId]);

    await client.query("COMMIT");

    if (result.rowCount === 0) {
      throw new Error("GAME_NOT_FOUND");
    }

    return result.rows[0];

  } catch (error) {

    await client.query("ROLLBACK");
    throw new Error(`DB_RESTART_GAME_FAILED: ${(error as Error).message}`);

  } finally {

    client.release();

  }
}

export async function getAllGamesRepo() {

  const query = `
    SELECT
      id,
      name,
      status,
      description,
      order_index
    FROM games
    WHERE is_active = true
    ORDER BY order_index ASC
  `;

  const result = await pool.query(query);

  return result.rows;

}