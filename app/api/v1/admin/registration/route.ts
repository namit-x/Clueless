import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { isRegistrationEnabled, isEnvRegistrationBlocked, setSetting } from "@/lib/repositories/settingsRepo";

/**
 * Return the current registration status and whether registration is blocked by environment configuration.
 *
 * @returns On success, a JSON response containing `registration_enabled` (boolean) and `env_override` (boolean). On error, a JSON response `{ error: string }` with status `401` when the request is unauthorized, otherwise `403`.
 */
export async function GET(req: NextRequest) {
    try {
        const user = await verifyToken(req);
        validateAdmin(user);

        const enabled = await isRegistrationEnabled();
        const envBlocked = isEnvRegistrationBlocked();
        return NextResponse.json({
            registration_enabled: enabled,
            env_override: envBlocked,
        });
    } catch (err: any) {
        const status = err.message === "Unauthorized" ? 401 : 403;
        return NextResponse.json({ error: err.message }, { status });
    }
}

/**
 * Toggle the application's registration setting using the request body.
 *
 * This endpoint requires an authenticated admin user. It reads a JSON body
 * with an `enabled` boolean and persists the new registration setting.
 *
 * @param req - Incoming NextRequest whose JSON body must include `enabled` (boolean)
 * @returns On success, `{ success: true, registration_enabled: <boolean> }`. On error,
 * `{ error: <message> }`; returns HTTP 400 for malformed body, 401 when unauthorized,
 * and 403 for other access-related errors.
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await verifyToken(req);
        validateAdmin(user);

        const body = await req.json();
        const { enabled } = body;

        if (typeof enabled !== "boolean") {
            return NextResponse.json(
                { error: "Request body must include `enabled` (boolean)" },
                { status: 400 }
            );
        }

        await setSetting("registration_enabled", String(enabled));

        return NextResponse.json({
            success: true,
            registration_enabled: enabled,
        });
    } catch (err: any) {
        const status = err.message === "Unauthorized" ? 401 : 403;
        return NextResponse.json({ error: err.message }, { status });
    }
}
