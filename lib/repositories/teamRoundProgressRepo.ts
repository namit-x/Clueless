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

  const result = await pool.query(query, [gameId]);
}

export async function initializeTeamRoundProgressForTeamRepo(teamId: string, gameId: string) {

  const roundsResult = await pool.query(
    `SELECT id FROM rounds WHERE game_id = $1`,
    [gameId]
  );

  if (roundsResult.rowCount === 0) {
    throw new Error("NO_ROUNDS_CONFIGURED");
  }

  const query = `
    INSERT INTO team_round_progress (team_id, round_id, status, attempt_count)
    SELECT $1, r.id, 'LOCKED', 0
    FROM rounds r
    WHERE r.game_id = $2
    ON CONFLICT (team_id, round_id) DO NOTHING
  `;

  await pool.query(query, [teamId, gameId]);
}

export async function activateFirstRoundRepo(teamId: string) {

  // Try to activate round 1 (LOCKED → ACTIVE)
  const activateQuery = `
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

  const result = await pool.query(activateQuery, [teamId]);

  if (result.rowCount && result.rowCount > 0) {
    return result.rows[0].round_id;
  }

  // Round 1 may already be ACTIVE (idempotent retry) — return it
  const fallbackQuery = `
    SELECT trp.round_id
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    JOIN games g ON g.id = r.game_id
    WHERE trp.team_id = $1
      AND r.round_number = 1
      AND g.is_active = true
      AND trp.status = 'ACTIVE'
  `;

  const fallback = await pool.query(fallbackQuery, [teamId]);

  if (fallback.rowCount === 0) {
    throw new Error("ROUND_ACTIVATION_FAILED");
  }

  return fallback.rows[0].round_id;
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
    return null;
  }

  return {
    roundId: result.rows[0].id,
    roundNumber: result.rows[0].round_number
  };
}

export async function getActiveOrFailedRoundRepo(teamId: string) {

  const query = `
    SELECT r.id, r.round_number, trp.status, trp.attempt_count
    FROM team_round_progress trp
    JOIN rounds r ON trp.round_id = r.id
    WHERE trp.team_id = $1
      AND trp.status IN ('ACTIVE', 'FAILED')
    LIMIT 1
  `;

  const result = await pool.query(query, [teamId]);

  if (result.rowCount === 0) {
    return null;
  }

  return {
    roundId: result.rows[0].id as string,
    roundNumber: result.rows[0].round_number as number,
    status: result.rows[0].status as string,
    attemptCount: result.rows[0].attempt_count as number
  };
}

export async function getRoundAttemptStatusRepo(teamId: string, roundId: string) {

  const result = await pool.query(
    `SELECT status, attempt_count
     FROM team_round_progress
     WHERE team_id = $1 AND round_id = $2`,
    [teamId, roundId]
  );

  if (result.rowCount === 0) {
    throw new Error("ROUND_PROGRESS_NOT_FOUND");
  }

  return {
    status: result.rows[0].status as string,
    attemptCount: result.rows[0].attempt_count as number
  };
}

export async function decreaseAttemptRepo(teamId: string, roundId: string): Promise<number> {

  const query = `
    UPDATE team_round_progress
    SET
      attempt_count = attempt_count + 1,
      status = CASE WHEN attempt_count + 1 >= 3 THEN 'FAILED' ELSE status END
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

export async function activateNextRoundRepo(teamId: string, roundNumber: number, gameId: string) {

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

  await pool.query(updateQuery, [teamId, gameId, roundNumber + 1]);
}

/**
 * Atomically: insert submission + complete round + advance to next round.
 * All in one transaction so submission and progress are always consistent.
 * Returns { advanced: boolean } — false means a concurrent request already completed this round.
 */
export async function submitAndAdvanceRoundRepo(
  teamId: string,
  roundId: string,
  roundNumber: number,
  gameId: string,
  answer: string,
  isCorrect: boolean,
  evaluationResult: string
): Promise<{ advanced: boolean }> {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Record the submission
    await client.query(
      `INSERT INTO submissions
         (team_id, round_id, submitted_answer, is_correct, evaluation_result, evaluated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [teamId, roundId, answer, isCorrect, evaluationResult]
    );

    // 2. Complete current round (status guard prevents double-completion)
    const completeResult = await client.query(
      `UPDATE team_round_progress
       SET status = 'COMPLETED', completed_at = NOW()
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'`,
      [teamId, roundId]
    );

    if (completeResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { advanced: false };
    }

    // 3. Activate next round (no-op for last round)
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
    return { advanced: true };

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Atomically: insert wrong submission + decrement attempts in one transaction.
 * The UPDATE uses WHERE status='ACTIVE' AND attempt_count < 3 to prevent
 * races with concurrent submissions.
 * Returns { attemptCount } or null if the round was no longer active/attempts exhausted.
 */
export async function submitAndDecrementAttemptRepo(
  teamId: string,
  roundId: string,
  answer: string,
  evaluationResult: string
): Promise<{ attemptCount: number } | null> {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Record the submission
    await client.query(
      `INSERT INTO submissions
         (team_id, round_id, submitted_answer, is_correct, evaluation_result, evaluated_at)
       VALUES ($1, $2, $3, false, $4, NOW())`,
      [teamId, roundId, answer, evaluationResult]
    );

    // 2. Atomically increment attempt_count, auto-fail at 3
    const result = await client.query(
      `UPDATE team_round_progress
       SET
         attempt_count = attempt_count + 1,
         status = CASE WHEN attempt_count + 1 >= 3 THEN 'FAILED' ELSE status END,
         failed_at = CASE WHEN attempt_count + 1 >= 3 THEN NOW() ELSE failed_at END
       WHERE team_id = $1
         AND round_id = $2
         AND status = 'ACTIVE'
         AND attempt_count < 3
       RETURNING attempt_count`,
      [teamId, roundId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("COMMIT");
    return { attemptCount: result.rows[0].attempt_count };

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}