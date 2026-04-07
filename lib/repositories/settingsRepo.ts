import { pool } from "@/lib/db";

/**
 * Retrieves the stored value for the given application setting key.
 *
 * @param key - The setting key to look up.
 * @returns The setting's string value if present, `null` if no entry exists.
 */
export async function getSetting(key: string): Promise<string | null> {
    const { rows } = await pool.query(
        `SELECT value FROM public.app_settings WHERE key = $1`,
        [key]
    );
    return rows[0]?.value ?? null;
}

/**
 * Stores or updates an application setting identified by `key` with the given `value`.
 *
 * @param key - Setting name to create or update
 * @param value - Value to assign to the setting
 */
export async function setSetting(key: string, value: string): Promise<void> {
    await pool.query(
        `INSERT INTO public.app_settings (key, value, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
        [key, value]
    );
}

/**
 * Determine whether user registrations are allowed.
 *
 * Checks a hard kill switch in the environment and a soft admin flag in the database; registrations are enabled only when neither blocks them.
 *
 * - If `process.env.REGISTRATION_ENABLED` is exactly `"false"`, registrations are blocked.
 * - Otherwise, the `app_settings` key `"registration_enabled"` is consulted; it blocks only when its value is exactly `"false"`.
 * - If the DB setting is missing, registrations default to enabled.
 *
 * @returns `true` if registrations are enabled, `false` otherwise.
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

/**
 * Indicates whether registration is blocked by the environment kill switch.
 *
 * @returns `true` if `process.env.REGISTRATION_ENABLED` is exactly `"false"`, `false` otherwise.
 */
export function isEnvRegistrationBlocked(): boolean {
    return process.env.REGISTRATION_ENABLED === "false";
}
