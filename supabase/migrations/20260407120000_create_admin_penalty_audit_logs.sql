CREATE TABLE IF NOT EXISTS public.admin_penalty_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_game_result_id uuid NOT NULL REFERENCES public.team_game_results(id) ON DELETE CASCADE,
    team_id uuid NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    admin_id text NOT NULL,
    old_penalty integer NOT NULL,
    new_penalty integer NOT NULL,
    operation text NOT NULL CHECK (operation IN ('SET', 'INCREMENT')),
    reason text NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_penalty_audit_logs_team_game_result_created_idx
    ON public.admin_penalty_audit_logs (team_game_result_id, created_at DESC);
