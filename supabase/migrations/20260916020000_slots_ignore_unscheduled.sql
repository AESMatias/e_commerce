-- =====================================================================
-- Unscheduled bookings were blocking the whole calendar.
--
-- tstzrange(null, null) is the unbounded range, which overlaps every slot,
-- so a single "I will get in touch" booking (no start time) made
-- get_available_slots return nothing at all. The booking filter now skips
-- rows without a time, exactly as the no-overlap constraint already does.
-- =====================================================================

create or replace function public.get_available_slots(p_from date, p_to date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with settings as (
    select * from public.scheduling_settings where id
  ),
  days as (
    select day::date as day
    from settings s
    cross join generate_series(
      greatest(p_from, (now() at time zone s.timezone)::date)::timestamp,
      least(p_to, (now() at time zone s.timezone)::date + s.max_days_ahead)::timestamp,
      interval '1 day'
    ) as day
  ),
  candidates as (
    select
      local_start at time zone s.timezone as starts_at,
      (local_start + make_interval(mins => s.slot_duration_minutes)) at time zone s.timezone as ends_at
    from days d
    cross join settings s
    join public.availability_rules r
      on r.is_active and r.weekday = extract(isodow from d.day)
    cross join lateral generate_series(
      d.day + r.start_time,
      d.day + r.end_time - make_interval(mins => s.slot_duration_minutes),
      make_interval(mins => s.slot_duration_minutes + s.buffer_minutes)
    ) as local_start
  )
  select c.starts_at, c.ends_at
  from candidates c
  cross join settings s
  where c.starts_at >= now() + make_interval(hours => s.min_notice_hours)
    and not exists (
      select 1
      from public.bookings b
      where b.starts_at is not null
        and (b.status = 'confirmed' or (b.status = 'pending_payment' and b.expires_at > now()))
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(
          c.starts_at - make_interval(mins => s.buffer_minutes),
          c.ends_at + make_interval(mins => s.buffer_minutes),
          '[)'
        )
    )
    and not exists (
      select 1
      from public.availability_exceptions e
      where tstzrange(e.starts_at, e.ends_at, '[)') && tstzrange(c.starts_at, c.ends_at, '[)')
    )
  order by c.starts_at;
$$;