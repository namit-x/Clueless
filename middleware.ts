import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { FEATURES } from "@/lib/features";

const SESSION_COOKIE = "session";

// --------------------------------------------------
// Route maps
// --------------------------------------------------

const BLOCKED_PAGE_ROUTES = [
    { pattern: /^\/login$/, feature: "LOGIN" },
    { pattern: /^\/dashboard(\/|$)/, feature: "DASHBOARD" },
    { pattern: /^\/games(\/|$)/, feature: "GAMES" },
    { pattern: /^\/admin(\/|$)/, feature: "ADMIN" },
] as const;

const BLOCKED_API_ROUTES = [
    { pattern: /^\/api\/auth\/login/, feature: "LOGIN" },
    { pattern: /^\/api\/auth\/logout/, feature: "LOGOUT" },
    { pattern: /^\/api\/auth\/session/, feature: "LOGIN" },
    { pattern: /^\/api\/game/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/games/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/rounds/, feature: "GAMES" },
    { pattern: /^\/api\/v1\/teams/, feature: "DASHBOARD" },
    { pattern: /^\/api\/team\/dashboard/, feature: "DASHBOARD" },
    { pattern: /^\/api\/admin/, feature: "ADMIN" },
    { pattern: /^\/api\/v1\/admin/, feature: "ADMIN" },
    { pattern: /^\/api\/dashboard/, feature: "DASHBOARD" },
] as const;

// --------------------------------------------------
// JWT helper
// --------------------------------------------------

type TokenPayload = {
    role?: "admin" | "team";
    sessionId?: string;
};

async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (!payload.sessionId) return null;
        return payload as TokenPayload;
    } catch {
        return null;
    }
}

// --------------------------------------------------
// Middleware
// --------------------------------------------------

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // DEBUG (remove later)
    // console.log("PATH:", pathname, "FEATURES:", FEATURES);

    // --------------------------------------------------
    // 1. Block disabled API routes
    // --------------------------------------------------
    if (pathname.startsWith("/api/")) {
        for (const rule of BLOCKED_API_ROUTES) {
            if (rule.pattern.test(pathname) && !FEATURES[rule.feature]) {
                return NextResponse.json(
                    { error: "This feature is disabled" },
                    { status: 403 }
                );
            }
        }

        // CSRF: reject mutating requests whose Origin doesn't match this host
        const method = req.method;
        if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
            const origin = req.headers.get("origin");
            if (origin) {
                const host = req.headers.get("host");
                const originHost = new URL(origin).host;
                if (host && originHost !== host) {
                    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                }
            }
        }

        return NextResponse.next();
    }

    // --------------------------------------------------
    // 2. Block disabled pages
    // --------------------------------------------------
    for (const rule of BLOCKED_PAGE_ROUTES) {
        if (rule.pattern.test(pathname) && !FEATURES[rule.feature]) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // --------------------------------------------------
    // 3. Auth check
    // --------------------------------------------------
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const user = token ? await verifyToken(token) : null;

    // --------------------------------------------------
    // 4. Auth pages logic
    // --------------------------------------------------
    if (pathname === "/login" || pathname === "/register") {
        if (user) {
            const redirectTo =
                user.role === "admin" ? "/admin/dashboard" : "/dashboard";

            const featureKey =
                user.role === "admin" ? "ADMIN" : "DASHBOARD";

            if (FEATURES[featureKey]) {
                return NextResponse.redirect(new URL(redirectTo, req.url));
            }
        }
        return NextResponse.next();
    }

    // --------------------------------------------------
    // 5. Admin protection
    // --------------------------------------------------
    if (pathname.startsWith("/admin")) {
        if (!user || user.role !== "admin") {
            return NextResponse.redirect(
                new URL(FEATURES.LOGIN ? "/login" : "/", req.url)
            );
        }
        return NextResponse.next();
    }

    // --------------------------------------------------
    // 6. Team protection
    // --------------------------------------------------
    if (pathname === "/dashboard" || pathname.startsWith("/games")) {
        if (!user || user.role !== "team") {
            return NextResponse.redirect(
                new URL(FEATURES.LOGIN ? "/login" : "/", req.url)
            );
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

// --------------------------------------------------
// Matcher (CRITICAL)
// --------------------------------------------------

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