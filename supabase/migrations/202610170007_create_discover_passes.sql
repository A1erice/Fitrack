create table if not exists public.discover_passes (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  movie jsonb not null default '{}'::jsonb,
  pass_count smallint not null default 1 check (pass_count between 1 and 2),
  first_passed_at timestamptz not null default now(),
  last_passed_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

alter table public.discover_passes enable row level security;

create policy "Users can read their own Discover passes"
  on public.discover_passes for select to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.discover_passes to authenticated;

create or replace function public.record_discover_pass(p_movie_id text, p_movie jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  updated_pass_count integer;
begin
  if current_user_id is null then
    raise exception 'Sign in to save passed movies.';
  end if;
  if p_movie_id is null or length(trim(p_movie_id)) = 0 or length(p_movie_id) > 100 then
    raise exception 'A valid movie ID is required.';
  end if;

  insert into public.discover_passes (user_id, movie_id, movie, pass_count)
  values (current_user_id, p_movie_id, coalesce(p_movie, '{}'::jsonb), 1)
  on conflict (user_id, movie_id) do update
    set movie = excluded.movie,
        pass_count = least(discover_passes.pass_count + 1, 2),
        last_passed_at = now()
  returning pass_count into updated_pass_count;

  return updated_pass_count;
end;
$$;

revoke all on function public.record_discover_pass(text, jsonb) from public, anon;
grant execute on function public.record_discover_pass(text, jsonb) to authenticated;
