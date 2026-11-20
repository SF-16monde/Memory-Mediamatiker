alter table public.leaderboard_scores
add column if not exists best_streak integer not null default 0;