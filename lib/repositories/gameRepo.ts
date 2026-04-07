import { pool } from "@/lib/db";

export async function getGameByIdRepo(gameId: string) {
  const query = `
    SELECT id, name, is_active
    FROM games
    WHERE id = $1;
  `;

  const result = await pool.query(query, [gameId]);

  if (result.rowCount === 0) {
    throw new Error("GAME_NOT_FOUND");
  }

  return result.rows[0];
}

export async function getActiveGameRepo() {
  const query = `
    SELECT id, name, is_active
    FROM games
    WHERE is_active = true
    ORDER BY started_at DESC NULLS LAST, order_index ASC
    LIMIT 1;
  `;

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new Error("ACTIVE_GAME_NOT_FOUND");
  }

  return result.rows[0];
}

export async function getTeamActiveGameRepo(teamId: string) {
  const query = `
    SELECT g.id, g.name
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    JOIN games g ON r.game_id = g.id
    LEFT JOIN team_game_results tgr
      ON tgr.team_id = trp.team_id
     AND tgr.game_id = g.id
    WHERE trp.team_id = $1
      AND trp.status IN ('ACTIVE', 'FAILED')
      AND (tgr.status IS NULL OR tgr.status = 'IN_PROGRESS')
    ORDER BY trp.started_at DESC NULLS LAST
    LIMIT 1;
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    throw new Error("NO_ACTIVE_GAME_FOR_TEAM");
  }

  // Integrity check: ensure only one active game per team
  const checkQuery = `
    SELECT DISTINCT g.id
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    JOIN games g ON r.game_id = g.id
    LEFT JOIN team_game_results tgr
      ON tgr.team_id = trp.team_id
     AND tgr.game_id = g.id
    WHERE trp.team_id = $1
      AND trp.status IN ('ACTIVE', 'FAILED')
      AND (tgr.status IS NULL OR tgr.status = 'IN_PROGRESS');
  `;

  const checkResult = await pool.query(checkQuery, [teamId]);
  const distinctGameIds = new Set(checkResult.rows.map((row: any) => row.id));

  if (distinctGameIds.size > 1) {
    throw new Error("DATA_INTEGRITY_ERROR: team has active rounds in multiple games");
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

  const result = await pool.query(query, [gameId]);

  if (result.rowCount === 0) {
    throw new Error("GAME_NOT_FOUND");
  }

  return result.rows[0];
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

  const result = await pool.query(query, [gameId]);

  if (result.rowCount === 0) {
    throw new Error("GAME_NOT_FOUND");
  }

  return result.rows[0];
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
      order_index,
      is_active
    FROM games
    ORDER BY order_index ASC
  `;

  const result = await pool.query(query);

  return result.rows;

}
