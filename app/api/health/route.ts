import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, string> = {};

    // Check env vars present (values masked)
    checks.PG_HOST = process.env.PG_HOST ? "set" : "MISSING";
    checks.PG_USER = process.env.PG_USER ? "set" : "MISSING";
    checks.PG_DATABASE = process.env.PG_DATABASE ? "set" : "MISSING";
    checks.PG_PASSWORD = process.env.PG_PASSWORD ? "set" : "MISSING";
    checks.JWT_SECRET = process.env.JWT_SECRET ? "set" : "MISSING";
    checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING";

    // Check DB connectivity
    try {
        await pool.query("SELECT 1");
        checks.database = "connected";
    } catch (err: any) {
        checks.database = `error: ${err.message}`;
    }

    const allOk = Object.values(checks).every((v) => v === "set" || v === "connected");

    return NextResponse.json(
        { ok: allOk, checks },
        { status: allOk ? 200 : 500 }
    );
}
