import { createClient } from "@supabase/supabase-js";

/**
 * SERVICE ROLE CLIENT — bypasses ALL Supabase RLS policies.
 *
 * ONLY use this for Supabase Auth admin operations:
 *   - supabaseAdmin.auth.admin.createUser()
 *   - supabaseAdmin.auth.admin.deleteUser()
 *
 * NEVER use this for database queries (.from(...).select/insert/update/delete).
 * All DB access must go through the native pg pool in lib/db.ts.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);