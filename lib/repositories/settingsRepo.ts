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

export async function isRegistrationEnabled(): Promise<boolean> {
    const value = await getSetting("registration_enabled");
    return value !== "false"; // default to true if row missing
}
