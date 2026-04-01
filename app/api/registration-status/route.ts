import { NextResponse } from "next/server";
import { isRegistrationEnabled } from "@/lib/repositories/settingsRepo";

/** Public endpoint — no auth required. Returns whether registration is open. */
export async function GET() {
    try {
        const enabled = await isRegistrationEnabled();
        return NextResponse.json(
            { registration_enabled: enabled },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        );
    } catch {
        // If the settings table doesn't exist yet, default to enabled
        return NextResponse.json({ registration_enabled: true });
    }
}
