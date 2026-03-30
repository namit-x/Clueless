ALTER TABLE public.team_round_progress
ADD COLUMN IF NOT EXISTS metadata jsonb;
