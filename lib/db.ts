import { Pool } from "pg";

export const pool = new Pool({
    user: "postgres.mawalvwezsqulvzmxdck",
    host: "aws-1-ap-southeast-2.pooler.supabase.com",
    database: "postgres",
    password: "Clueless!@_JAIN",
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    },
    // Optimize pool for serverless environment
    max: 5,                    // Small pool for single-process Vercel
    idleTimeoutMillis: 30000,  // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Fail fast on connection issues
});

// Pre-warm the pool connection on module load for faster cold starts
pool.query("SELECT 1").catch(err => {
    console.error("[DB] Pool initialization warning:", err.message);
});
