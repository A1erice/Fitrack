alter table public.profiles
  add column if not exists movie_blacklist jsonb not null default '{"excludeYears":false,"yearFrom":1870,"yearTo":2000,"genreIds":[],"languages":[]}'::jsonb;
