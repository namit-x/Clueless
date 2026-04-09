import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";

const useSsl =
    process.env.PG_SSL === "true" ||
    process.env.PG_SSL === "1" ||
    isProduction;

const ssl = useSsl
    ? {
        rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED === "true",
        ca: process.env.PG_SSL_CA || undefined,
    }
    : false;

export const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
    ssl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,    // kill queries that run longer than 15s
    query_timeout: 15000,        // client-side timeout as a second safety net
});