create table if not exists public.streaming_expiry_cache (
  cache_key text primary key,
  cache_date date not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.streaming_expiry_cache enable row level security;

revoke all on table public.streaming_expiry_cache from anon, authenticated;
grant select, insert, update, delete on table public.streaming_expiry_cache to service_role;
