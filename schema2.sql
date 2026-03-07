--
-- PostgreSQL database dump
--

\restrict xo60obEmrfJJjXxgzzD2wSAIlbs2xVkiBsDl6CatFXc7bB6l8chEH0BU7VOiCRe

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_game_order_index(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_game_order_index() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.order_index IS NULL THEN
    SELECT COALESCE(MAX(order_index),0) + 1
    INTO NEW.order_index
    FROM games;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_game_order_index() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_logs (
    id uuid NOT NULL,
    admin_identifier text NOT NULL,
    action_type text NOT NULL,
    target_type text,
    target_id uuid,
    reason text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: final_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_submissions (
    id uuid NOT NULL,
    team_id uuid,
    sentence text NOT NULL,
    is_correct boolean,
    submitted_at timestamp without time zone DEFAULT now(),
    evaluated_at timestamp without time zone
);


ALTER TABLE public.final_submissions OWNER TO postgres;

--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id uuid NOT NULL,
    name text NOT NULL,
    order_index integer NOT NULL,
    status text DEFAULT 'NOT_STARTED'::text NOT NULL,
    started_at timestamp without time zone,
    paused_at timestamp without time zone,
    resumed_at timestamp without time zone,
    ended_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    description text
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    member_id uuid NOT NULL,
    team_id uuid NOT NULL,
    name text NOT NULL,
    mobile text NOT NULL,
    email text NOT NULL,
    branch text NOT NULL,
    is_leader boolean NOT NULL,
    role text DEFAULT 'user'::text NOT NULL
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: reward_words; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reward_words (
    id uuid NOT NULL,
    team_id uuid,
    game_id uuid,
    word text NOT NULL,
    revealed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reward_words OWNER TO postgres;

--
-- Name: rounds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rounds (
    id uuid NOT NULL,
    game_id uuid,
    round_number integer NOT NULL,
    title text,
    configuration jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rounds OWNER TO postgres;

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    id uuid NOT NULL,
    team_id uuid,
    round_id uuid,
    submitted_answer text,
    is_correct boolean,
    evaluation_result text,
    submitted_at timestamp without time zone DEFAULT now(),
    evaluated_at timestamp without time zone
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: team_round_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_round_progress (
    id uuid NOT NULL,
    team_id uuid,
    round_id uuid,
    status text NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    failed_at timestamp without time zone,
    attempt_count integer DEFAULT 0
);


ALTER TABLE public.team_round_progress OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    team_id uuid NOT NULL,
    team_name text NOT NULL,
    team_size integer NOT NULL,
    owner_id uuid
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: final_submissions final_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_submissions
    ADD CONSTRAINT final_submissions_pkey PRIMARY KEY (id);


--
-- Name: final_submissions final_submissions_team_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_submissions
    ADD CONSTRAINT final_submissions_team_id_key UNIQUE (team_id);


--
-- Name: games games_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_name_key UNIQUE (name);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (member_id);


--
-- Name: reward_words reward_words_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_words
    ADD CONSTRAINT reward_words_pkey PRIMARY KEY (id);


--
-- Name: reward_words reward_words_team_id_game_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_words
    ADD CONSTRAINT reward_words_team_id_game_id_key UNIQUE (team_id, game_id);


--
-- Name: rounds rounds_game_id_round_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_game_id_round_number_key UNIQUE (game_id, round_number);


--
-- Name: rounds rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: team_round_progress team_round_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_round_progress
    ADD CONSTRAINT team_round_progress_pkey PRIMARY KEY (id);


--
-- Name: team_round_progress team_round_progress_team_id_round_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_round_progress
    ADD CONSTRAINT team_round_progress_team_id_round_id_key UNIQUE (team_id, round_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (team_id);


--
-- Name: teams teams_team_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_team_name_key UNIQUE (team_name);


--
-- Name: games assign_game_order; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assign_game_order BEFORE INSERT ON public.games FOR EACH ROW EXECUTE FUNCTION public.set_game_order_index();


--
-- Name: final_submissions final_submissions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_submissions
    ADD CONSTRAINT final_submissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE;


--
-- Name: members fk_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE;


--
-- Name: reward_words reward_words_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_words
    ADD CONSTRAINT reward_words_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: reward_words reward_words_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_words
    ADD CONSTRAINT reward_words_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE;


--
-- Name: rounds rounds_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.rounds(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE;


--
-- Name: team_round_progress team_round_progress_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_round_progress
    ADD CONSTRAINT team_round_progress_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.rounds(id) ON DELETE CASCADE;


--
-- Name: team_round_progress team_round_progress_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_round_progress
    ADD CONSTRAINT team_round_progress_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO namit;


--
-- Name: TABLE admin_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_logs TO namit;


--
-- Name: TABLE final_submissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.final_submissions TO namit;


--
-- Name: TABLE games; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.games TO namit;


--
-- Name: TABLE members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.members TO namit;


--
-- Name: TABLE reward_words; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reward_words TO namit;


--
-- Name: TABLE rounds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rounds TO namit;


--
-- Name: TABLE submissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.submissions TO namit;


--
-- Name: TABLE team_round_progress; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_round_progress TO namit;


--
-- Name: TABLE teams; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.teams TO namit;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO namit;


--
-- PostgreSQL database dump complete
--

\unrestrict xo60obEmrfJJjXxgzzD2wSAIlbs2xVkiBsDl6CatFXc7bB6l8chEH0BU7VOiCRe

