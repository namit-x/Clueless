import { pool } from "@/lib/db";

export async function initializeTeamRoundProgressRepo(gameId: string) {

  const query = `
        INSERT INTO team_round_progress (team_id, round_id, status, attempt_count)
        SELECT
            t.team_id,
            r.id,
            'LOCKED',
            0
        FROM teams t
        CROSS JOIN rounds r
        WHERE
            t.is_approved = true
            AND r.game_id = $1
        ON CONFLICT (team_id, round_id) DO NOTHING
    `;

  await pool.query(query, [gameId]);
}

export async function activateFirstRoundRepo(teamId: string) {

  const query = `
    UPDATE team_round_progress trp
    SET status = 'ACTIVE',
        started_at = NOW()
    FROM rounds r
    JOIN games g ON g.id = r.game_id
    WHERE trp.round_id = r.id
    AND trp.team_id = $1
    AND trp.status = 'LOCKED'
    AND r.round_number = 1
    AND g.is_active = true
    RETURNING trp.round_id;
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    throw new Error("ROUND_ACTIVATION_FAILED");
  }

  return result.rows[0].round_id;
}

export async function getCurrentRoundRepo(teamId: string) {

  const query = `
    SELECT r.id, r.round_number
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
    AND trp.status = 'ACTIVE'
    LIMIT 1
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    throw new Error("ACTIVE_ROUND_NOT_FOUND");
  }

  return {
    roundId: result.rows[0].id,
    roundNumber: result.rows[0].round_number
  };
}

export async function decreaseAttemptRepo(teamId: string, roundId: string): Promise<number> {

  const query = `
    UPDATE team_round_progress
    SET attempt_count = attempt_count + 1
    WHERE team_id = $1
      AND round_id = $2
      AND status = 'ACTIVE'
      AND attempt_count < 3
    RETURNING attempt_count
  `;

  const result = await pool.query(query, [teamId, roundId]);

  if (result.rowCount === 0) {
    throw new Error("MAX_ATTEMPTS_REACHED");
  }

  return result.rows[0].attempt_count;
}

export async function completeRoundRepo(teamId: string, roundId: string) {

  const query = `
    UPDATE team_round_progress
    SET status = 'COMPLETED',
        completed_at = NOW()
    WHERE team_id = $1 AND round_id = $2
  `;

  await pool.query(query, [teamId, roundId]);
}

/**
 * Atomically completes the current round and activates the next one.
 * Uses a transaction with a status guard on the complete step to prevent
 * double-processing from concurrent requests.
 *
 * Returns true if the round was completed, false if it was already completed
 * (idempotent — safe to call twice).
 *
 * For round 3 (the last round), the next-round activation finds no rows and
 * is a no-op. The caller is responsible for recording game completion in
 * that case.
 */
export async function completeAndAdvanceRoundRepo(
  teamId: string,
  roundId: string,
  roundNumber: number,
  gameId: string
): Promise<boolean> {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const completeResult = await client.query(
      `UPDATE team_round_progress
       SET status = 'COMPLETED', completed_at = NOW()
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'`,
      [teamId, roundId]
    );

    if (completeResult.rowCount === 0) {
      // Round was already completed by a concurrent request — safe no-op
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(
      `UPDATE team_round_progress
       SET status = 'ACTIVE', started_at = NOW()
       WHERE team_id = $1
         AND round_id = (
           SELECT id FROM rounds
           WHERE game_id = $2
             AND round_number = $3
           LIMIT 1
         )`,
      [teamId, gameId, roundNumber + 1]
    );

    await client.query("COMMIT");
    return true;

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function activateNextRoundRepo(teamId: string, currentRoundNumber: number) {

  // First, get the game_id from team's current completed round to ensure we stay in the same game
  const gameQuery = `
    SELECT DISTINCT r.game_id
    FROM team_round_progress trp
    JOIN rounds r ON r.id = trp.round_id
    WHERE trp.team_id = $1
    AND trp.status = 'COMPLETED'
    ORDER BY r.game_id
    LIMIT 1
  `;

  const gameResult = await pool.query(gameQuery, [teamId]);

  if (gameResult.rowCount === 0) {
    throw new Error("GAME_CONTEXT_NOT_FOUND");
  }

  const gameId = gameResult.rows[0].game_id;

  // Now activate the next round for this specific game
  const updateQuery = `
    UPDATE team_round_progress
    SET status = 'ACTIVE',
        started_at = NOW()
    WHERE team_id = $1
    AND round_id = (
      SELECT id
      FROM rounds
      WHERE game_id = $2
      AND round_number = $3
      LIMIT 1
    )
  `;

  await pool.query(updateQuery, [teamId, gameId, currentRoundNumber + 1]);
}