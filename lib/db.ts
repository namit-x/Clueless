import { Pool } from "pg";

// Validate required env vars
const requiredEnv = [
    "PG_USER",
    "PG_HOST",
    "PG_DATABASE",
    "PG_PASSWORD",
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
}

// 👇 Global type to persist pool across hot reloads (dev)
const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
};

// 👇 Singleton pool (prevents connection explosion)
export const pool =
    globalForDb.pool ??
    new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: Number(process.env.PG_PORT) || 5432,
        ssl: {
            rejectUnauthorized: false,
        },
        max: 5, // reduce to 3 if using free tier (Supabase/Neon)
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

// 👇 Persist in dev (important for Next.js hot reload)
if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
}