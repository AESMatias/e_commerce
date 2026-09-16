-- Stripe Checkout support
-- * payments.stripe_checkout_url lets a visitor resume an unpaid checkout.
-- * The hold is extended to 35 minutes: a Stripe Checkout session must
--   expire at least 30 minutes in the future, and we set the session to
--   expire exactly when our hold does.
-- * confirm_booking_payment / expire_checkout_session are the only two
--   writes the webhook performs, each atomic and idempotent.
alter table public.payments add column stripe_checkout_url text;

update public.scheduling_settings set hold_minutes = 35 where id;


-- Marks the payment as paid and confirms the booking.
-- returns: 'confirmed', 'already_paid', 'unknown_session', 'slot_conflict'
create or replace function public.confirm_booking_payment(
  p_session_id        text,
  p_payment_intent_id text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
  v_booking public.bookings;
begin
  select * into v_payment
  from public.payments
  where stripe_checkout_session_id = p_session_id
  for update;

  if not found then
    return 'unknown_session';
  end if;

  if v_payment.status = 'paid' then
    return 'already_paid';
  end if;

  update public.payments
  set status = 'paid',
      paid_at = now(),
      stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
  where id = v_payment.id;

  select * into v_booking
  from public.bookings
  where id = v_payment.booking_id
  for update;

  if v_booking.status = 'confirmed' then
    return 'confirmed';
  end if;

  begin
    update public.bookings
    set status = 'confirmed',
        confirmed_at = now()
    where id = v_booking.id;

    return 'confirmed';
  exception
    when exclusion_violation then
      -- The hold had expired and somebody else took the slot. The payment
      -- stays recorded as paid so it can be refunded or rescheduled by hand.
      update public.bookings set status = 'cancelled' where id = v_booking.id;
      return 'slot_conflict';
  end;
end;
$$;


-- Releases the slot when Stripe reports the checkout session expired.
create or replace function public.expire_checkout_session(p_session_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
begin
  select * into v_payment
  from public.payments
  where stripe_checkout_session_id = p_session_id
  for update;

  if not found then
    return 'unknown_session';
  end if;

  if v_payment.status = 'paid' then
    return 'already_paid';
  end if;

  update public.payments set status = 'expired' where id = v_payment.id;

  update public.bookings
  set status = 'expired'
  where id = v_payment.booking_id and status = 'pending_payment';

  return 'expired';
end;
$$;


revoke execute on function public.confirm_booking_payment(text, text) from public, anon, authenticated;
grant execute on function public.confirm_booking_payment(text, text) to service_role;

revoke execute on function public.expire_checkout_session(text) from public, anon, authenticated;
grant execute on function public.expire_checkout_session(text) to service_role;
