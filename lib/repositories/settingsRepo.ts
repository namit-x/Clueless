import { pool } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
    const { rows } = await pool.query(
        `SELECT value FROM public.app_settings WHERE key = $1`,
        [key]
    );
    return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
    await pool.query(
        `INSERT INTO public.app_settings (key, value, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
        [key, value]
    );
}

/**
 * Dual-check registration gate:
 * 1. REGISTRATION_ENABLED env var (hard kill switch — instant override)
 * 2. DB admin flag in app_settings (soft control — admin toggle)
 *
 * Both must be true for registrations to be open.
 */
export async function isRegistrationEnabled(): Promise<boolean> {
    // Hard kill switch — env var takes priority
    if (process.env.REGISTRATION_ENABLED === "false") {
        return false;
    }

    // Soft control — admin DB toggle
    const value = await getSetting("registration_enabled");
    return value !== "false"; // default to true if row missing
}

/** Returns whether the env kill switch is blocking registrations. */
export function isEnvRegistrationBlocked(): boolean {
    return process.env.REGISTRATION_ENABLED === "false";
}
