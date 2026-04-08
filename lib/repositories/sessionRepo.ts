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

    const result = await pool.query<{
        session_id: string;
        expires_at: Date;
        previous_session_id: string | null;
    }>(
        `
        WITH previous AS (
            SELECT session_id
            FROM public.sessions
            WHERE owner_type = $1 AND owner_id = $2
        ),
        upsert AS (
            INSERT INTO public.sessions (owner_type, owner_id, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (owner_type, owner_id)
            DO UPDATE SET
                session_id = gen_random_uuid(),
                expires_at = EXCLUDED.expires_at
            RETURNING session_id, expires_at
        )
        SELECT 
            upsert.session_id,
            upsert.expires_at,
            previous.session_id AS previous_session_id
        FROM upsert
        LEFT JOIN previous ON true
        `,
        [params.ownerType, params.ownerId, params.expiresAt]
    );

    const row = result.rows[0];

    return {
        sessionId: row.session_id,
        expiresAt: row.expires_at,
        previousSessionId: row.previous_session_id ?? undefined,
    };
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
    AND expires_at > NOW()
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
