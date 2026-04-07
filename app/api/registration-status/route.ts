import { NextResponse } from "next/server";
import { isRegistrationEnabled, isEnvRegistrationBlocked } from "@/lib/repositories/settingsRepo";

/**
 * Indicates whether new user registration is enabled and whether an environment-level override is active.
 *
 * @returns A JSON object with `registration_enabled` — `true` when registration is enabled, `false` otherwise; and `env_override` — `true` when an environment-based block is active, `false` otherwise. When the settings cannot be read, defaults to `{ registration_enabled: true, env_override: false }`.
 */
export async function GET() {
    try {
        const enabled = await isRegistrationEnabled();
        return NextResponse.json(
            {
                registration_enabled: enabled,
                // Let the frontend know if an env override is active (no sensitive details exposed)
                env_override: isEnvRegistrationBlocked(),
            },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        );
    } catch {
        // If the settings table doesn't exist yet, default to enabled
        return NextResponse.json({ registration_enabled: true, env_override: false });
    }
}
