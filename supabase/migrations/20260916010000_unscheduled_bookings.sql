-- Unscheduled bookings
-- A client can skip the calendar and ask to arrange the call afterwards.
-- Those bookings have no starts_at/ends_at, so they must be excluded from
-- the no-overlap constraint (an empty range would otherwise match everything).

alter table public.bookings
  alter column starts_at drop not null,
  alter column ends_at drop not null;

alter table public.bookings
  add constraint bookings_times_together check ((starts_at is null) = (ends_at is null));

alter table public.bookings drop constraint bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_payment', 'confirmed') and starts_at is not null);


-- create_booking_hold now accepts a null start time, which means 
-- "no time chosen; the client will arrange it".
create or replace function public.create_booking_hold(
  p_package_slug      text,
  p_starts_at         timestamptz,
  p_email             text,
  p_full_name         text,
  p_company           text default null,
  p_project_notes     text default null,
  p_recommendation_id uuid default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings    public.scheduling_settings;
  v_package     public.service_packages;
  v_local_day   date;
  v_customer_id uuid;
  v_booking     public.bookings;
begin
  select * into v_settings from public.scheduling_settings where id;

  select p.* into v_package
  from public.service_packages p
  join public.services s on s.id = p.service_id
  where p.slug = p_package_slug and p.is_active and s.is_active;

  if not found then
    raise exception 'Package "%" was not found', p_package_slug using errcode = 'DS404';
  end if;

  -- Release unpaid holds that already expired so their slots can be taken.
  update public.bookings
  set status = 'expired'
  where status = 'pending_payment' and expires_at <= now();

  if p_starts_at is not null then
    v_local_day := (p_starts_at at time zone v_settings.timezone)::date;

    if not exists (
      select 1
      from public.get_available_slots(v_local_day, v_local_day) slot
      where slot.starts_at = p_starts_at
    ) then
      raise exception 'The selected time slot is not available' using errcode = 'DS409';
    end if;
  end if;

  insert into public.customers as c (email, full_name, company)
  values (lower(trim(p_email)), trim(p_full_name), nullif(trim(p_company), ''))
  on conflict (email) do update
    set full_name = excluded.full_name,
        company = coalesce(excluded.company, c.company)
  returning c.id into v_customer_id;

  insert into public.bookings (
    customer_id, package_id, recommendation_id, starts_at, ends_at,
    deposit_cents, currency, project_notes, expires_at
  )
  values (
    v_customer_id,
    v_package.id,
    p_recommendation_id,
    p_starts_at,
    case
      when p_starts_at is null then null
      else p_starts_at + make_interval(mins => v_settings.slot_duration_minutes)
    end,
    v_package.deposit_cents,
    v_package.currency,
    nullif(trim(p_project_notes), ''),
    now() + make_interval(mins => v_settings.hold_minutes)
  )
  returning * into v_booking;

  return v_booking;
exception
  when exclusion_violation then
    raise exception 'The selected time slot is not available' using errcode = 'DS409';
end;
$$;
