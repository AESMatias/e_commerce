-- Catalog      services -> service_packages (tiers)
-- Scheduling   scheduling_settings + availability_rules (+ exceptions)
--              generate slots on the fly; nothing is pre-materialized.
-- Booking      customers (email only, no auth) -> bookings -> payments
-- AI           advisor_recommendations (Phase 3)
-- Stripe       stripe_events for idempotent webhook processing (Phase 5)
-- Security model: there is no end-user auth. The browser never talks to
-- the database directly. Next.js server code uses the publishable key for
-- public reads (RLS applies) and the secret key for writes.




-- Enums
create type public.service_icon as enum ('globe', 'cart', 'bot', 'code', 'chart');
create type public.package_tier as enum ('starter', 'growth', 'scale');
create type public.booking_status as enum ('pending_payment', 'confirmed', 'cancelled', 'expired');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded');


-- Shared trigger: keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- Catalog
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  tagline     text not null,
  description text not null,
  icon        public.service_icon not null,
  ideal_for   text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.service_packages (
  id                 uuid primary key default gen_random_uuid(),
  service_id         uuid not null references public.services (id) on delete cascade,
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tier               public.package_tier not null,
  name               text not null,
  summary            text not null,
  price_cents        integer not null check (price_cents > 0),
  deposit_cents      integer not null check (deposit_cents > 0),
  currency           text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  timeline_weeks_min smallint not null check (timeline_weeks_min > 0),
  timeline_weeks_max smallint not null,
  deliverables       text[] not null default '{}',
  is_popular         boolean not null default false,
  sort_order         smallint not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (service_id, tier),
  check (deposit_cents <= price_cents),
  check (timeline_weeks_max >= timeline_weeks_min)
);

create index service_packages_service_id_idx on public.service_packages (service_id);

-- At most one highlighted ("Most popular") tier per service.
create unique index service_packages_one_popular_per_service
  on public.service_packages (service_id)
  where is_popular;


-- Scheduling
-- Single-row table (id is always true).
create table public.scheduling_settings (
  id                    boolean primary key default true check (id),
  timezone              text not null default 'America/Santiago',
  slot_duration_minutes smallint not null default 30 check (slot_duration_minutes between 15 and 240),
  buffer_minutes        smallint not null default 15 check (buffer_minutes between 0 and 120),
  min_notice_hours      smallint not null default 24 check (min_notice_hours >= 0),
  max_days_ahead        smallint not null default 30 check (max_days_ahead between 1 and 180),
  -- How long an unpaid booking holds its slot. Stripe Checkout sessions
  -- expire after 30 minutes at the earliest, so the hold can't be shorter.
  hold_minutes          smallint not null default 30 check (hold_minutes between 30 and 1440),
  updated_at            timestamptz not null default now()
);

insert into public.scheduling_settings (id) values (true);

-- Weekly recurring working hours, in scheduling_settings.timezone.
create table public.availability_rules (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint not null check (weekday between 1 and 7), -- ISO 8601: 1 = Monday, 7 = Sunday
  start_time time not null,
  end_time   time not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (weekday, start_time),
  check (end_time > start_time)
);

-- One-off blocked periods (holidays, time off).
create table public.availability_exceptions (
  id         uuid primary key default gen_random_uuid(),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);


-- Customers (identified by email, no auth account)
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique
             check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name  text not null check (char_length(full_name) between 1 and 120),
  company    text check (char_length(company) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- AI advisor
create table public.advisor_recommendations (
  id              uuid primary key default gen_random_uuid(),
  package_id      uuid references public.service_packages (id) on delete set null,
  problem_summary text not null,
  response        jsonb not null,
  model           text not null,
  created_at      timestamptz not null default now()
);

create index advisor_recommendations_package_id_idx on public.advisor_recommendations (package_id);


-- Bookings
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customers (id) on delete restrict,
  package_id        uuid not null references public.service_packages (id) on delete restrict,
  recommendation_id uuid references public.advisor_recommendations (id) on delete set null,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  status            public.booking_status not null default 'pending_payment',
  -- Snapshot of the deposit at booking time; later price changes don't affect it.
  deposit_cents     integer not null check (deposit_cents > 0),
  currency          text not null check (currency ~ '^[a-z]{3}$'),
  project_notes     text check (char_length(project_notes) <= 2000),
  expires_at        timestamptz not null,
  confirmed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Last line of defense against double booking under concurrent requests.
  constraint bookings_no_overlap exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_payment', 'confirmed'))
);

create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_package_id_idx on public.bookings (package_id);
create index bookings_recommendation_id_idx on public.bookings (recommendation_id);


-- Stripe payments
create table public.payments (
  id                         uuid primary key default gen_random_uuid(),
  booking_id                 uuid not null references public.bookings (id) on delete restrict,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id   text unique,
  amount_cents               integer not null check (amount_cents > 0),
  currency                   text not null check (currency ~ '^[a-z]{3}$'),
  status                     public.payment_status not null default 'pending',
  paid_at                    timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index payments_booking_id_idx on public.payments (booking_id);

-- A booking can have several checkout attempts but only one successful payment.
create unique index payments_one_paid_per_booking
  on public.payments (booking_id)
  where status = 'paid';

-- Every processed Stripe event id is stored once, so replayed webhooks are ignored.
create table public.stripe_events (
  id           text primary key,
  type         text not null,
  payload      jsonb not null,
  processed_at timestamptz not null default now()
);


-- updated_at triggers
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger service_packages_set_updated_at before update on public.service_packages
  for each row execute function public.set_updated_at();
create trigger scheduling_settings_set_updated_at before update on public.scheduling_settings
  for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();


-- Slot generation: Expands the weekly rules into concrete slots for [p_from, p_to] (dates in
-- the business timezone), then removes slots that are too soon, beyond the
-- booking horizon, inside an exception, or overlapping an active booking
-- (including the buffer). Only start/end times are exposed.
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
      where (b.status = 'confirmed' or (b.status = 'pending_payment' and b.expires_at > now()))
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


-- Booking hold
-- Atomically: validates the package and slot, upserts the customer by
-- email and creates a pending_payment booking that holds the slot for
-- scheduling_settings.hold_minutes. Called only from our server.
-- Custom error codes (read from error.code in supabase-js):
--   DS404  package not found or inactive
--   DS409  slot not available
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

  v_local_day := (p_starts_at at time zone v_settings.timezone)::date;

  if not exists (
    select 1
    from public.get_available_slots(v_local_day, v_local_day) slot
    where slot.starts_at = p_starts_at
  ) then
    raise exception 'The selected time slot is not available' using errcode = 'DS409';
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
    p_starts_at + make_interval(mins => v_settings.slot_duration_minutes),
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


-- Row level security and privileges
alter table public.services                enable row level security;
alter table public.service_packages        enable row level security;
alter table public.scheduling_settings     enable row level security;
alter table public.availability_rules      enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.customers               enable row level security;
alter table public.advisor_recommendations enable row level security;
alter table public.bookings                enable row level security;
alter table public.payments                enable row level security;
alter table public.stripe_events           enable row level security;

-- Defense in depth: public roles get nothing by default...
revoke all on table
  public.services,
  public.service_packages,
  public.scheduling_settings,
  public.availability_rules,
  public.availability_exceptions,
  public.customers,
  public.advisor_recommendations,
  public.bookings,
  public.payments,
  public.stripe_events
from anon, authenticated;

-- ...except read access to the active catalog.
grant select on table public.services, public.service_packages to anon, authenticated;

create policy "Active services are public"
  on public.services for select
  to anon, authenticated
  using (is_active);

create policy "Active packages of active services are public"
  on public.service_packages for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.services s
      where s.id = service_packages.service_id and s.is_active
    )
  );

-- Everything else (customers, bookings, payments...) has no policies:
-- only the service role (secret key, server-side) can access it.

revoke execute on function public.set_updated_at() from public, anon, authenticated;

revoke execute on function public.get_available_slots(date, date) from public;
grant execute on function public.get_available_slots(date, date) to anon, authenticated, service_role;

revoke execute on function public.create_booking_hold(text, timestamptz, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_booking_hold(text, timestamptz, text, text, text, text, uuid)
  to service_role;
