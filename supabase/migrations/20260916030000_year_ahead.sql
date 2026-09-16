-- Let the calendar open a whole year.
alter table public.scheduling_settings
  drop constraint scheduling_settings_max_days_ahead_check;

alter table public.scheduling_settings
  add constraint scheduling_settings_max_days_ahead_check
  check (max_days_ahead between 1 and 400);