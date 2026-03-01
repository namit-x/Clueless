
  create table "public"."members" (
    "member_id" uuid not null,
    "team_id" uuid not null,
    "name" text not null,
    "mobile" text not null,
    "email" text not null,
    "branch" text not null,
    "is_leader" boolean not null,
    "role" text not null default 'user'::text
      );



  create table "public"."teams" (
    "team_id" uuid not null,
    "team_name" text not null,
    "team_size" integer not null,
    "owner_id" uuid
      );


CREATE UNIQUE INDEX members_pkey ON public.members USING btree (member_id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (team_id);

CREATE UNIQUE INDEX teams_team_name_key ON public.teams USING btree (team_name);

alter table "public"."members" add constraint "members_pkey" PRIMARY KEY using index "members_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."members" add constraint "members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE not valid;

alter table "public"."members" validate constraint "members_team_id_fkey";

alter table "public"."teams" add constraint "teams_team_name_key" UNIQUE using index "teams_team_name_key";

grant delete on table "public"."members" to "anon";

grant insert on table "public"."members" to "anon";

grant references on table "public"."members" to "anon";

grant select on table "public"."members" to "anon";

grant trigger on table "public"."members" to "anon";

grant truncate on table "public"."members" to "anon";

grant update on table "public"."members" to "anon";

grant delete on table "public"."members" to "authenticated";

grant insert on table "public"."members" to "authenticated";

grant references on table "public"."members" to "authenticated";

grant select on table "public"."members" to "authenticated";

grant trigger on table "public"."members" to "authenticated";

grant truncate on table "public"."members" to "authenticated";

grant update on table "public"."members" to "authenticated";

grant delete on table "public"."members" to "service_role";

grant insert on table "public"."members" to "service_role";

grant references on table "public"."members" to "service_role";

grant select on table "public"."members" to "service_role";

grant trigger on table "public"."members" to "service_role";

grant truncate on table "public"."members" to "service_role";

grant update on table "public"."members" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";


