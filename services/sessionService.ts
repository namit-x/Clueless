import {
    createOrReplaceSessionRepo,
    validateSessionRepo,
    revokeSessionRepo,
    // touchSessionRepo,
    CreateOrReplaceSessionParams,
    ValidateSessionParams,
    SessionIdentity
} from "@/lib/repositories/sessionRepo";

type OwnerType = "team" | "admin";

export interface CreateSessionInput extends SessionIdentity {
    ttlMs: number;
}

export interface CreateSessionResult {
    sessionId: string;
    expiresAt: Date;
    previousSessionId?: string;
}

export interface ValidateSessionInput extends ValidateSessionParams { }

/**
 * Creates or replaces a session for the specified owner and returns the new session metadata.
 *
 * @param input - Object containing `ownerType`, `ownerId`, and `ttlMs` (time-to-live in milliseconds)
 * @returns The created session information: `sessionId`, `expiresAt`, and `previousSessionId` if a prior session was replaced
 */
export async function createOrReplaceSession(
    input: CreateSessionInput
): Promise<CreateSessionResult> {

    const expiresAt = new Date(Date.now() + input.ttlMs);

    const params: CreateOrReplaceSessionParams = {
        ownerType: input.ownerType as OwnerType,
        ownerId: input.ownerId,
        expiresAt
    };

    console.log("Creating session for", params.ownerType, params.ownerId);

    const result = await createOrReplaceSessionRepo(params);

    return {
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
        previousSessionId: result.previousSessionId
    };
}

export async function validateSession(
    input: ValidateSessionInput
): Promise<void> {

    const session = await validateSessionRepo(input);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    if (session.expires_at <= new Date()) {
        throw new Error("SESSION_EXPIRED");
    }

    // best-effort heartbeat (noop in current schema)
    // touchSessionRepo(session.session_id).catch(() => { });
}

export async function revokeSession(
    input: ValidateSessionInput
): Promise<void> {
    await revokeSessionRepo(input);
}