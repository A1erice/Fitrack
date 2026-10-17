delete from public.collection_movies old_row
where old_row.movie_id = 'tmdb-49051'
  and exists (
    select 1 from public.collection_movies wrong_row
    where wrong_row.collection_id = old_row.collection_id
      and wrong_row.movie_id = 'tmdb-49026'
      and wrong_row.movie->>'title' = 'The Hobbit: An Unexpected Journey'
  );

update public.collection_movies
set movie_id = 'tmdb-49051',
    movie = jsonb_set(movie, '{title}', to_jsonb('The Hobbit: An Unexpected Journey'::text))
where movie_id = 'tmdb-49026'
  and movie->>'title' = 'The Hobbit: An Unexpected Journey';

insert into public.collection_movies (collection_id, user_id, movie_id, movie)
select id, user_id, 'tmdb-49026', '{"title":"The Hobbit: The Desolation of Smaug","year":2013,"genre":"Fantasy · Adventure"}'::jsonb
from public.collections
where name = 'Dark fantasy'
on conflict (collection_id, movie_id) do nothing;
