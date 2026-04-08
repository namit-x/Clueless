import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { validateSessionRepo } from "@/lib/repositories/sessionRepo";

type JwtPayload = {
    teamId?: string;
    teamName?: string;
    role?: string;
    adminName?: string;
    sessionId?: string;
    iat?: number;
    exp?: number;
};

export async function verifyToken(req: NextRequest): Promise<JwtPayload> {
    const token = req.cookies.get("session")?.value;

    if (!token) {
        console.error("[Auth][verifyToken] Missing session cookie");
        throw new Error("Unauthorized");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        if (!decoded) {
            console.error("[Auth][verifyToken] JWT decoded payload is empty");
            throw new Error("Invalid token");
        }

        if (!decoded.sessionId) {
            console.error("[Auth][verifyToken] Missing sessionId in token payload");
            throw new Error("Invalid token");
        }

        const ownerType = decoded.role === "admin" ? "admin" : "team";
        let ownerId: string;
        if (ownerType === "team") {
            ownerId = String(decoded.teamId);
        } else {
            // Admin: reconstruct ownerId from adminName and position in ADMIN_USERS
            const ADMIN_USERS = process.env.ADMIN_STRINGS?.split(",") || [];
            const adminIndex = ADMIN_USERS.findIndex(
                (admin) => admin.trim() === decoded.adminName?.trim()
            );
            if (adminIndex === -1) {
                console.error("[Auth][verifyToken] Admin identity mismatch", { adminName: decoded.adminName });
                throw new Error("Invalid admin identity");
            }
            ownerId = `admin_${adminIndex}`;
        }

        // Verify session is still valid in the database (catches revoked sessions)
        const session = await validateSessionRepo({
            ownerType,
            ownerId,
            sessionId: decoded.sessionId!,
        });

        if (!session) {
            throw new Error("Session revoked or expired");
        }

        return decoded;
    } catch (error: any) {
        console.error("[Auth][verifyToken] Verification failed:", error.message);
        throw new Error("Invalid token");
    }
}
