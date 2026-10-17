create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  description text not null default '',
  icon text not null default '✦',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.collection_movies (
  collection_id uuid not null references public.collections (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  movie jsonb not null default '{}'::jsonb,
  added_at timestamptz not null default now(),
  primary key (collection_id, movie_id)
);

alter table public.collections enable row level security;
alter table public.collection_movies enable row level security;

create policy "Users can manage their own collections" on public.collections
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can manage their own collection movies" on public.collection_movies
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.collections to authenticated;
grant select, insert, update, delete on public.collection_movies to authenticated;

create or replace function public.seed_default_collections()
returns trigger language plpgsql security definer set search_path = public as $$
declare favorites_id uuid;
declare dark_id uuid;
begin
  insert into public.collections (user_id, name, description, icon, is_default)
    values (new.id, 'Favorites', 'Stories that stayed with you.', '♥', true)
    on conflict (user_id, name) do nothing;
  insert into public.collections (user_id, name, description, icon)
    values (new.id, 'Dark fantasy', 'Myths, quests, and shadowed kingdoms.', '🐉')
    on conflict (user_id, name) do nothing returning id into dark_id;
  if dark_id is null then
    select id into dark_id from public.collections where user_id = new.id and name = 'Dark fantasy';
  end if;
  insert into public.collection_movies (collection_id, user_id, movie_id, movie)
  values
    (dark_id, new.id, 'tmdb-120', '{"title":"The Lord of the Rings: The Fellowship of the Ring","year":2001,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-121', '{"title":"The Lord of the Rings: The Two Towers","year":2002,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-122', '{"title":"The Lord of the Rings: The Return of the King","year":2003,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-49051', '{"title":"The Hobbit: An Unexpected Journey","year":2012,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-57158', '{"title":"The Hobbit: The Desolation of Smaug","year":2013,"genre":"Fantasy · Adventure"}'::jsonb)
  on conflict (collection_id, movie_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_seed_collections on public.profiles;
create trigger on_profile_created_seed_collections
  after insert on public.profiles
  for each row execute function public.seed_default_collections();

-- Backfill the same starter collections for profiles that already existed
-- before this migration was applied.
insert into public.collections (user_id, name, description, icon, is_default)
select id, 'Favorites', 'Stories that stayed with you.', '♥', true from public.profiles
on conflict (user_id, name) do nothing;
insert into public.collections (user_id, name, description, icon)
select id, 'Dark fantasy', 'Myths, quests, and shadowed kingdoms.', '🐉' from public.profiles
on conflict (user_id, name) do nothing;
insert into public.collection_movies (collection_id, user_id, movie_id, movie)
select c.id, c.user_id, seed.movie_id, seed.movie
from public.collections c
cross join (values
  ('tmdb-120', '{"title":"The Lord of the Rings: The Fellowship of the Ring","year":2001,"genre":"Fantasy · Adventure"}'::jsonb),
  ('tmdb-121', '{"title":"The Lord of the Rings: The Two Towers","year":2002,"genre":"Fantasy · Adventure"}'::jsonb),
  ('tmdb-122', '{"title":"The Lord of the Rings: The Return of the King","year":2003,"genre":"Fantasy · Adventure"}'::jsonb),
  ('tmdb-49051', '{"title":"The Hobbit: An Unexpected Journey","year":2012,"genre":"Fantasy · Adventure"}'::jsonb),
  ('tmdb-57158', '{"title":"The Hobbit: The Desolation of Smaug","year":2013,"genre":"Fantasy · Adventure"}'::jsonb)
) as seed(movie_id, movie)
where c.name = 'Dark fantasy'
on conflict (collection_id, movie_id) do nothing;
