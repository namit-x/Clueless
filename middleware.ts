import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// -------------------------------------------------------------------
// Session cookie name (matches lib/cookies.ts and middleware/verifyToken.ts)
// -------------------------------------------------------------------
const SESSION_COOKIE = "session";

// -------------------------------------------------------------------
// JWT verification helper — uses jose (edge-compatible) with the same
// HS256 secret used in lib/auth.ts for signing.
// -------------------------------------------------------------------
type TokenPayload = {
    role?: string;
    teamId?: string;
    teamName?: string;
    adminName?: string;
    sessionId?: string;
};

async function verifySessionToken(
    token: string
): Promise<TokenPayload | null> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ["HS256"],
        });
        // Require a sessionId to consider the token valid (same check as verifyToken.ts)
        if (!payload.sessionId) return null;
        return payload as TokenPayload;
    } catch {
        return null;
    }
}

// -------------------------------------------------------------------
// Middleware
// -------------------------------------------------------------------
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ---------------------------------------------------------------
    // 1. Read & verify the session cookie (shared across all checks)
    // ---------------------------------------------------------------
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = token ? await verifySessionToken(token) : null;

    // ---------------------------------------------------------------
    // 2. Auth pages (/login, /register) — redirect away if already
    //    authenticated so users don't see login forms again.
    // ---------------------------------------------------------------
    if (pathname === "/login" || pathname === "/register") {
        if (payload) {
            const dest =
                payload.role === "admin" ? "/admin/dashboard" : "/dashboard";
            return NextResponse.redirect(new URL(dest, req.url));
        }
        // Not authenticated — let them through to the auth page
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 3. Admin pages (/admin/*) — must be an authenticated admin
    // ---------------------------------------------------------------
    if (pathname.startsWith("/admin")) {
        if (!payload || payload.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 4. Team pages (/dashboard, /games) — must be an authenticated team
    // ---------------------------------------------------------------
    if (pathname === "/dashboard" || pathname.startsWith("/games")) {
        if (!payload || payload.role !== "team") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 5. Everything else matched by the config — allow through
    // ---------------------------------------------------------------
    return NextResponse.next();
}

// -------------------------------------------------------------------
// Matcher — only run middleware on pages that need auth checks.
// Static files (_next, favicon, images, sounds) and API routes are
// excluded so they always pass through without overhead.
// -------------------------------------------------------------------
export const config = {
    matcher: [
        "/login",
        "/register",
        "/admin/:path*",
        "/dashboard",
        "/games/:path*",
    ],
};
