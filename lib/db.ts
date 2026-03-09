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
});