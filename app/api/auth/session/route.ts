import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 *
 * Lightweight endpoint for client-side session heartbeat.
 * Returns { valid: true, sessionId } if the session cookie is still active in the DB.
 * Returns { valid: false } if the session is revoked, expired, or cookie is missing.
 *
 * Used by useSessionRealtime to detect when a session has been replaced
 * (e.g. another device logged in) without querying Supabase directly.
 */
export async function GET(req: NextRequest) {
    try {
        const decoded = await verifyToken(req);
        return NextResponse.json({ valid: true, sessionId: decoded.sessionId });
    } catch {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}
