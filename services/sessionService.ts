import {
    createOrReplaceSessionRepo,
    validateSessionRepo,
    revokeSessionRepo,
    // touchSessionRepo,
    CreateOrReplaceSessionParams,
    ValidateSessionParams,
    SessionIdentity
} from "@/lib/repositories/sessionRepo";

import { broadcastForceLogout } from "@/lib/sessionConnections";

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

export async function createOrReplaceSession(
    input: CreateSessionInput
): Promise<CreateSessionResult> {

    const expiresAt = new Date(Date.now() + input.ttlMs);

    const params: CreateOrReplaceSessionParams = {
        ownerType: input.ownerType as OwnerType,
        ownerId: input.ownerId,
        expiresAt
    };

    const result = await createOrReplaceSessionRepo(params);

    // force logout previous session if replaced
    if (result.previousSessionId) {
        broadcastForceLogout(result.previousSessionId);
    }

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