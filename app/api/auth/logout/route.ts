import { NextRequest, NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/cookies";
import { verifyToken } from "@/middleware/verifyToken";
import { revokeSessionController } from "@/controllers/sessionController";

export async function POST(req: NextRequest) {
    try {
        const decoded = await verifyToken(req);

        if (!decoded.sessionId) {
            throw new Error("SESSION_ID_MISSING_FROM_TOKEN");
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
                throw new Error("Invalid admin identity");
            }
            ownerId = `admin_${adminIndex}`;
        }

        await revokeSessionController({
            ownerType,
            ownerId,
            sessionId: decoded.sessionId
        });
    } catch (error) {
        // Even if revocation fails, we still clear the cookie to log out the client.
        console.error("[Auth][logout] Failed to revoke session:", error);
    }

    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully"
    });

    deleteSessionCookie(response);

    return response;
}
