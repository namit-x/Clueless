CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE admin_logs
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE final_submissions
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE games
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE reward_words
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE rounds
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE submissions
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE team_round_progress
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE members
ALTER COLUMN member_id SET DEFAULT gen_random_uuid();

ALTER TABLE teams
ALTER COLUMN team_id SET DEFAULT gen_random_uuid();