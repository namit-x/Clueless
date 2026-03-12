import {
    createOrReplaceSession,
    validateSession,
    revokeSession,
    CreateSessionInput
} from "@/services/sessionService";

export async function createSessionController(input: CreateSessionInput) {
    return createOrReplaceSession(input);
}

export async function validateSessionController(input: {
    ownerType: "team" | "admin";
    ownerId: string;
    sessionId: string;
}) {
    await validateSession(input);
}

export async function revokeSessionController(input: {
    ownerType: "team" | "admin";
    ownerId: string;
    sessionId: string;
}) {
    await revokeSession(input);
}
