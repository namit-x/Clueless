import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { FEATURES } from "@/lib/features";

// -------------------------------------------------------------------
// Session cookie name
// -------------------------------------------------------------------
const SESSION_COOKIE = "session";

// -------------------------------------------------------------------
// Feature-flag route blocking maps
// -------------------------------------------------------------------

/** Page routes that are blocked when the corresponding feature is disabled. */
const BLOCKED_PAGE_ROUTES: { pattern: RegExp; feature: keyof typeof FEATURES }[] = [
    { pattern: /^\/login$/, feature: "LOGIN" },
    { pattern: /^\/dashboard(\/|$)/, feature: "DASHBOARD" },
    { pattern: /^\/games(\/|$)/, feature: "GAMES" },
    { pattern: /^\/admin(\/|$)/, feature: "ADMIN" },
];

/** API routes that are blocked when the corresponding feature is disabled. */
const BLOCKED_API_ROUTES: { pattern: RegExp; feature: keyof typeof FEATURES }[] = [
    { pattern: /^\/api\/auth\/login(\/|$)/, feature: "LOGIN" },
    { pattern: /^\/api\/auth\/logout(\/|$)/, feature: "LOGOUT" },
    { pattern: /^\/api\/auth\/session(\/|$)/, feature: "LOGIN" },
    { pattern: /^\/api\/game(\/|$)/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/games(\/|$)/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/rounds(\/|$)/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/teams(\/|$)/, feature: "DASHBOARD" },
    { pattern: /^\/api\/team\/dashboard(\/|$)/, feature: "DASHBOARD" },
    { pattern: /^\/api\/admin(\/|$)/, feature: "ADMIN" },
    { pattern: /^\/api\/v1\/admin(\/|$)/, feature: "ADMIN" },
    { pattern: /^\/api\/dashboard(\/|$)/, feature: "DASHBOARD" },
];

// -------------------------------------------------------------------
// JWT verification helper
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
    // 1. Feature-flag: block disabled API routes with 403 JSON
    // ---------------------------------------------------------------
    if (pathname.startsWith("/api/")) {
        for (const rule of BLOCKED_API_ROUTES) {
            if (rule.pattern.test(pathname) && !FEATURES[rule.feature]) {
                return NextResponse.json(
                    { error: "This feature is not available yet." },
                    { status: 403 }
                );
            }
        }
        // API routes that aren't blocked pass through (no auth check here;
        // individual route handlers do their own auth).
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 2. Feature-flag: block disabled page routes → redirect to /
    // ---------------------------------------------------------------
    for (const rule of BLOCKED_PAGE_ROUTES) {
        if (rule.pattern.test(pathname) && !FEATURES[rule.feature]) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // ---------------------------------------------------------------
    // 3. Read & verify the session cookie
    // ---------------------------------------------------------------
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = token ? await verifySessionToken(token) : null;

    // ---------------------------------------------------------------
    // 4. Auth pages (/login, /register) — redirect if already logged in,
    //    but only when the destination feature is actually enabled.
    // ---------------------------------------------------------------
    if (pathname === "/login" || pathname === "/register") {
        if (payload) {
            const dest =
                payload.role === "admin" ? "/admin/dashboard" : "/dashboard";
            const destFeature: keyof typeof FEATURES =
                payload.role === "admin" ? "ADMIN" : "DASHBOARD";

            // Only redirect to dashboard if that feature is live;
            // otherwise let them stay on the auth page.
            if (FEATURES[destFeature]) {
                return NextResponse.redirect(new URL(dest, req.url));
            }
        }
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 5. Admin pages (/admin/*) — must be an authenticated admin
    // ---------------------------------------------------------------
    if (pathname.startsWith("/admin")) {
        if (!payload || payload.role !== "admin") {
            const loginDest = FEATURES.LOGIN ? "/login" : "/";
            return NextResponse.redirect(new URL(loginDest, req.url));
        }
        return NextResponse.next();
    }

    // ---------------------------------------------------------------
    // 6. Team pages (/dashboard, /games) — must be an authenticated team
    // ---------------------------------------------------------------
    if (pathname === "/dashboard" || pathname.startsWith("/games")) {
        if (!payload || payload.role !== "team") {
            const loginDest = FEATURES.LOGIN ? "/login" : "/";
            return NextResponse.redirect(new URL(loginDest, req.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

// -------------------------------------------------------------------
// Matcher — run middleware on auth-checked pages AND all API routes
// -------------------------------------------------------------------
export const config = {
    matcher: [
        "/login",
        "/register",
        "/admin/:path*",
        "/dashboard",
        "/games/:path*",
        "/api/:path*",
    ],
};
