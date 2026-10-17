-- Correct the Hobbit TMDB identifiers used by the Dark fantasy starter list.
-- 49026 is The Dark Knight Rises; Smaug is 57158.

delete from public.collection_movies wrong_row
using public.collections c
where wrong_row.collection_id = c.id
  and c.name = 'Dark fantasy'
  and wrong_row.movie_id = 'tmdb-49051'
  and wrong_row.movie->>'title' = 'The Hobbit: The Desolation of Smaug'
  and exists (
    select 1 from public.collection_movies correct_row
    where correct_row.collection_id = wrong_row.collection_id
      and correct_row.movie_id = 'tmdb-57158'
  );

update public.collection_movies
set movie_id = 'tmdb-57158',
    movie = jsonb_set(movie, '{tmdbId}', '57158'::jsonb, true)
where movie_id = 'tmdb-49051'
  and movie->>'title' = 'The Hobbit: The Desolation of Smaug';

delete from public.collection_movies wrong_row
using public.collections c
where wrong_row.collection_id = c.id
  and c.name = 'Dark fantasy'
  and wrong_row.movie_id = 'tmdb-49026'
  and wrong_row.movie->>'title' = 'The Hobbit: An Unexpected Journey'
  and exists (
    select 1 from public.collection_movies correct_row
    where correct_row.collection_id = wrong_row.collection_id
      and correct_row.movie_id = 'tmdb-49051'
  );

update public.collection_movies
set movie_id = 'tmdb-49051',
    movie = jsonb_set(movie, '{tmdbId}', '49051'::jsonb, true)
where movie_id = 'tmdb-49026'
  and movie->>'title' = 'The Hobbit: An Unexpected Journey';

delete from public.collection_movies wrong_row
using public.collections c
where wrong_row.collection_id = c.id
  and c.name = 'Dark fantasy'
  and wrong_row.movie_id = 'tmdb-49026'
  and wrong_row.movie->>'title' = 'The Hobbit: The Desolation of Smaug'
  and exists (
    select 1 from public.collection_movies correct_row
    where correct_row.collection_id = wrong_row.collection_id
      and correct_row.movie_id = 'tmdb-57158'
  );

update public.collection_movies
set movie_id = 'tmdb-57158',
    movie = jsonb_set(movie, '{tmdbId}', '57158'::jsonb, true)
where movie_id = 'tmdb-49026'
  and movie->>'title' = 'The Hobbit: The Desolation of Smaug';

insert into public.collection_movies (collection_id, user_id, movie_id, movie)
select c.id, c.user_id, seed.movie_id, seed.movie
from public.collections c
cross join (values
  ('tmdb-49051', '{"tmdbId":49051,"title":"The Hobbit: An Unexpected Journey","year":2012,"genre":"Fantasy · Adventure"}'::jsonb),
  ('tmdb-57158', '{"tmdbId":57158,"title":"The Hobbit: The Desolation of Smaug","year":2013,"genre":"Fantasy · Adventure"}'::jsonb)
) as seed(movie_id, movie)
where c.name = 'Dark fantasy'
on conflict (collection_id, movie_id) do nothing;

create or replace function public.seed_default_collections()
returns trigger language plpgsql security definer set search_path = public as $$
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
    (dark_id, new.id, 'tmdb-120', '{"tmdbId":120,"title":"The Lord of the Rings: The Fellowship of the Ring","year":2001,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-121', '{"tmdbId":121,"title":"The Lord of the Rings: The Two Towers","year":2002,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-122', '{"tmdbId":122,"title":"The Lord of the Rings: The Return of the King","year":2003,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-49051', '{"tmdbId":49051,"title":"The Hobbit: An Unexpected Journey","year":2012,"genre":"Fantasy · Adventure"}'::jsonb),
    (dark_id, new.id, 'tmdb-57158', '{"tmdbId":57158,"title":"The Hobbit: The Desolation of Smaug","year":2013,"genre":"Fantasy · Adventure"}'::jsonb)
  on conflict (collection_id, movie_id) do nothing;
  return new;
end;
$$;
