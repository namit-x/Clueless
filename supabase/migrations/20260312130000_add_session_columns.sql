-- Add additional columns to public.sessions to support single-login sessions

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS revoked_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS last_seen_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Add unique constraint to enforce single login per owner
-- This ensures only one session per (owner_type, owner_id) pair can be ACTIVE
ALTER TABLE public.sessions
ADD CONSTRAINT unique_owner_session UNIQUE (owner_type, owner_id);

