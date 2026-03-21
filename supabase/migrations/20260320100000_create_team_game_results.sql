CREATE TABLE IF NOT EXISTS public.team_game_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    started_at timestamp without time zone NOT NULL DEFAULT now(),
    completed_at timestamp without time zone,
    completion_time interval,
    penalty_seconds integer DEFAULT 0,
    status text NOT NULL DEFAULT 'IN_PROGRESS',
    created_at timestamp without time zone DEFAULT now(),
    UNIQUE (team_id, game_id)
);

GRANT ALL ON TABLE public.team_game_results TO namit;
