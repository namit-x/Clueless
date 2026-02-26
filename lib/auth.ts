import { SignJWT } from "jose";

function getJwtSecret(): Uint8Array {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret.trim().length === 0) {
        throw new Error("Missing JWT_SECRET environment variable");
    }

    return new TextEncoder().encode(jwtSecret);
}

export async function createSessionToken(payload: {
    teamId: number;
    teamName: string;
}) {
    const secret = getJwtSecret();

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // session duration
        .sign(secret);
}
