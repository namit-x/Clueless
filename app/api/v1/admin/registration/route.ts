import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/middleware/verifyToken";
import { validateAdmin } from "@/middleware/validateAdmin";
import { isRegistrationEnabled, isEnvRegistrationBlocked, setSetting } from "@/lib/repositories/settingsRepo";

/** GET  — return current registration status */
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

/** PATCH — toggle registration on/off */
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
