


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."set_game_order_index"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."set_game_order_index"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_identifier" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "target_type" "text",
    "target_id" "uuid",
    "reason" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."final_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "sentence" "text" NOT NULL,
    "is_correct" boolean,
    "submitted_at" timestamp without time zone DEFAULT "now"(),
    "evaluated_at" timestamp without time zone
);


ALTER TABLE "public"."final_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "order_index" integer NOT NULL,
    "status" "text" DEFAULT 'NOT_STARTED'::"text" NOT NULL,
    "started_at" timestamp without time zone,
    "paused_at" timestamp without time zone,
    "resumed_at" timestamp without time zone,
    "ended_at" timestamp without time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "description" "text"
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "member_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "mobile" "text" NOT NULL,
    "email" "text" NOT NULL,
    "branch" "text" NOT NULL,
    "is_leader" boolean NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reward_words" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "game_id" "uuid",
    "word" "text" NOT NULL,
    "revealed_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."reward_words" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rounds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "game_id" "uuid",
    "round_number" integer NOT NULL,
    "title" "text",
    "configuration" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."rounds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "round_id" "uuid",
    "submitted_answer" "text",
    "is_correct" boolean,
    "evaluation_result" "text",
    "submitted_at" timestamp without time zone DEFAULT "now"(),
    "evaluated_at" timestamp without time zone
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_round_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "round_id" "uuid",
    "status" "text" NOT NULL,
    "started_at" timestamp without time zone,
    "completed_at" timestamp without time zone,
    "failed_at" timestamp without time zone,
    "attempt_count" integer DEFAULT 0
);


ALTER TABLE "public"."team_round_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "team_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_name" "text" NOT NULL,
    "team_size" integer NOT NULL,
    "owner_id" "uuid",
    "is_approved" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."final_submissions"
    ADD CONSTRAINT "final_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."final_submissions"
    ADD CONSTRAINT "final_submissions_team_id_key" UNIQUE ("team_id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("member_id");



ALTER TABLE ONLY "public"."reward_words"
    ADD CONSTRAINT "reward_words_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reward_words"
    ADD CONSTRAINT "reward_words_team_id_game_id_key" UNIQUE ("team_id", "game_id");



ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "rounds_game_id_round_number_key" UNIQUE ("game_id", "round_number");



ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "rounds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_round_progress"
    ADD CONSTRAINT "team_round_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_round_progress"
    ADD CONSTRAINT "team_round_progress_team_id_round_id_key" UNIQUE ("team_id", "round_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_team_name_key" UNIQUE ("team_name");



CREATE OR REPLACE TRIGGER "assign_game_order" BEFORE INSERT ON "public"."games" FOR EACH ROW EXECUTE FUNCTION "public"."set_game_order_index"();



ALTER TABLE ONLY "public"."final_submissions"
    ADD CONSTRAINT "final_submissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "fk_team" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reward_words"
    ADD CONSTRAINT "reward_words_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reward_words"
    ADD CONSTRAINT "reward_words_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "rounds_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_round_progress"
    ADD CONSTRAINT "team_round_progress_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_round_progress"
    ADD CONSTRAINT "team_round_progress_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."set_game_order_index"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_game_order_index"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_game_order_index"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_logs" TO "service_role";



GRANT ALL ON TABLE "public"."final_submissions" TO "anon";
GRANT ALL ON TABLE "public"."final_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."final_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."reward_words" TO "anon";
GRANT ALL ON TABLE "public"."reward_words" TO "authenticated";
GRANT ALL ON TABLE "public"."reward_words" TO "service_role";



GRANT ALL ON TABLE "public"."rounds" TO "anon";
GRANT ALL ON TABLE "public"."rounds" TO "authenticated";
GRANT ALL ON TABLE "public"."rounds" TO "service_role";



GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";



GRANT ALL ON TABLE "public"."team_round_progress" TO "anon";
GRANT ALL ON TABLE "public"."team_round_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."team_round_progress" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


