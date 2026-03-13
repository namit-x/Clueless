import { pool } from "@/lib/db";

type OwnerType = "team" | "admin";

export interface SessionIdentity {
    ownerType: OwnerType;
    ownerId: string;
}

export interface CreateOrReplaceSessionParams extends SessionIdentity {
    expiresAt: Date;
}

export interface CreateOrReplaceSessionResult {
    sessionId: string;
    expiresAt: Date;
    previousSessionId?: string;
}

export interface ValidateSessionParams extends SessionIdentity {
    sessionId: string;
}

export interface SessionRow {
    id: string;
    owner_type: OwnerType;
    owner_id: string;
    session_id: string;
    created_at: Date;
    expires_at: Date;
}

export async function createOrReplaceSessionRepo(
    params: CreateOrReplaceSessionParams
): Promise<CreateOrReplaceSessionResult> {

    console.log("Checking existing active session...");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");















        // I WAS HERE MOTHER FUCKERRRRRRR














        const existing = await client.query<Pick<SessionRow, "session_id">>(
            `
      SELECT session_id
      FROM public.sessions
      WHERE owner_type = $1
      AND owner_id = $2
      FOR UPDATE
      `,
            [params.ownerType, params.ownerId]
        );

        let previousSessionId: string | undefined;

        if (existing.rowCount && existing.rows[0].session_id) {
            previousSessionId = existing.rows[0].session_id;

            await client.query(
                `
        DELETE FROM public.sessions
        WHERE owner_type = $1
        AND owner_id = $2
        `,
                [params.ownerType, params.ownerId]
            );
        }

        const insertResult = await client.query<
            Pick<SessionRow, "session_id" | "expires_at">
        >(
            `
      INSERT INTO public.sessions (
        owner_type,
        owner_id,
        expires_at
      )
      VALUES ($1,$2,$3)
      RETURNING session_id, expires_at
      `,
            [params.ownerType, params.ownerId, params.expiresAt]
        );

        await client.query("COMMIT");

        const row = insertResult.rows[0];

        return {
            sessionId: row.session_id,
            expiresAt: row.expires_at,
            previousSessionId,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function validateSessionRepo(
    params: ValidateSessionParams
): Promise<SessionRow | null> {
    const result = await pool.query<SessionRow>(
        `
    SELECT *
    FROM public.sessions
    WHERE owner_type = $1
    AND owner_id = $2
    AND session_id = $3
    LIMIT 1
    `,
        [params.ownerType, params.ownerId, params.sessionId]
    );

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

export async function revokeSessionRepo(
    params: ValidateSessionParams
): Promise<void> {
    await pool.query(
        `
    DELETE FROM public.sessions
    WHERE owner_type = $1
    AND owner_id = $2
    AND session_id = $3
    `,
        [params.ownerType, params.ownerId, params.sessionId]
    );
}

// export async function touchSessionRepo(): Promise<void> {
//     /**
//      * No-op for now.
//      * Your schema does not track last_seen_at.
//      * Leaving this function here keeps service-layer contracts stable.
//      */
//     return;
// }