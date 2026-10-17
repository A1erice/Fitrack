create table if not exists public.watchlist_movies (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  movie jsonb not null default '{}'::jsonb,
  status text not null default 'to_watch' check (status in ('to_watch', 'watched')),
  added_at timestamptz not null default now(),
  watched_at timestamptz,
  primary key (user_id, movie_id)
);

create index if not exists watchlist_movies_user_status_added_idx
  on public.watchlist_movies (user_id, status, added_at);

alter table public.watchlist_movies enable row level security;

create policy "Users can manage their own watchlist movies"
  on public.watchlist_movies for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.watchlist_movies to authenticated;
