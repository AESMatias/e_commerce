-- Global spending cap for the AI advisor.
-- The counters used to live in server memory, so every Vercel instance had
-- its own and a cold start or deploy reset them. They now live here, shared
-- by every instance.
--
-- Buckets are fixed time windows, named after the window they cover:
--   'day:2026-09-16'        one per UTC day
--   'window:1789560000'     one per short window (start as epoch seconds)
create table public.advisor_usage (
  bucket     text primary key,
  used       integer not null default 0,
  expires_at timestamptz not null
);

-- No policies: only the service role (which bypasses RLS) can touch it.
alter table public.advisor_usage enable row level security;


-- Consumes one advisor request from both global limits, or none if either
-- is exhausted. Row locks make it safe under concurrent requests.
-- returns: 0 when allowed, otherwise the seconds until the blocking
-- window resets.
create or replace function public.consume_advisor_quota(
  p_daily_limit    integer,
  p_window_limit   integer,
  p_window_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now        timestamptz := now();
  v_day_start  timestamptz := date_trunc('day', v_now at time zone 'utc') at time zone 'utc';
  v_day_end    timestamptz := v_day_start + interval '1 day';
  v_win_start  timestamptz := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);
  v_win_end    timestamptz := v_win_start + make_interval(secs => p_window_seconds);
  v_day_key    text := 'day:' || to_char(v_day_start at time zone 'utc', 'YYYY-MM-DD');
  v_win_key    text := 'window:' || extract(epoch from v_win_start)::bigint;
  v_day_used   integer;
  v_win_used   integer;
begin
  insert into public.advisor_usage (bucket, expires_at)
  values (v_day_key, v_day_end), (v_win_key, v_win_end)
  on conflict (bucket) do nothing;

  -- Always lock in the same order (day, then window) to avoid deadlocks.
  select used into v_day_used from public.advisor_usage where bucket = v_day_key for update;
  select used into v_win_used from public.advisor_usage where bucket = v_win_key for update;

  if v_day_used >= p_daily_limit then
    return greatest(1, ceil(extract(epoch from v_day_end - v_now)))::integer;
  end if;

  if v_win_used >= p_window_limit then
    return greatest(1, ceil(extract(epoch from v_win_end - v_now)))::integer;
  end if;

  update public.advisor_usage
  set used = used + 1
  where bucket in (v_day_key, v_win_key);

  delete from public.advisor_usage where expires_at < v_now;

  return 0;
end;
$$;

revoke execute on function public.consume_advisor_quota(integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_advisor_quota(integer, integer, integer) to service_role;
