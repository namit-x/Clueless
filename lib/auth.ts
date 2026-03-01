import { SignJWT } from "jose";

function getJwtSecret(): Uint8Array {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret.trim().length === 0) {
        throw new Error("Missing JWT_SECRET environment variable");
    }

    return new TextEncoder().encode(jwtSecret);
}

/**
 * Session payload types
 */
type AdminPayload = {
    role: "admin";
    adminName: string;
};

type UserPayload = {
    role: "user";
    teamId: number;
    teamName: string;
};

type SessionPayload = AdminPayload | UserPayload;

export async function createSessionToken(payload: SessionPayload) {
    const secret = getJwtSecret();

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}