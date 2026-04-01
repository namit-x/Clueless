-- App-level settings (key-value store for admin-controlled flags)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the registration flag (enabled by default)
INSERT INTO public.app_settings (key, value)
VALUES ('registration_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
