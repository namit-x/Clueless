import { Pool } from "pg";

export const pool = new Pool({
    user: "namit",
    host: "localhost",
    database: "clueless_db",
    password: "new_password",
    port: 5432,
});
