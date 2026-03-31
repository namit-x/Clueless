import { Pool } from "pg";

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

// Debug (remove after confirming)
console.log("DB CONFIG:", {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
});

export const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
    ssl: {
        rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// TEMP: test DB connection
(async () => {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("DB Connected:", res.rows[0]);
    } catch (err) {
        console.error("DB ERROR:", err);
    }
})();