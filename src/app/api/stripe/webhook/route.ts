import type Stripe from "stripe";
import { sendBookingConfirmedEmails } from "@/lib/booking/notifications";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

// Signature verification needs the Node crypto runtime and the raw body.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !webhookSecret) {
    return new Response("Stripe is not configured.", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    // Either a forged request or a stale signing secret. Never process it.
    return new Response("Invalid signature.", { status: 400 });
  }

  const supabase = createAdminClient();

  // The event id is the primary key, so a replayed event is stored once and
  // the handler below runs at most once per event.
  const { error: storeError } = await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    payload: JSON.parse(payload) as never,
  });

  if (storeError) {
    if (storeError.code === "23505") {
      return Response.json({ received: true, duplicate: true });
    }
    console.error("Failed to store Stripe event", storeError);
    return new Response("Could not store the event.", { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status !== "paid") break;

      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

      const { data, error } = await supabase.rpc("confirm_booking_payment", {
        p_session_id: session.id,
        p_payment_intent_id: paymentIntentId ?? undefined,
      });

      if (error) {
        console.error("Failed to confirm booking", error);
        return new Response("Could not confirm the booking.", { status: 500 });
      }

      if (data === "confirmed" && session.metadata?.booking_id) {
        await sendBookingConfirmedEmails(session.metadata.booking_id);
      }

      if (data === "slot_conflict") {
        console.error(
          `Paid session ${session.id} could not be confirmed: the slot was taken. Refund or reschedule manually.`,
        );
      }
      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const { error } = await supabase.rpc("expire_checkout_session", { p_session_id: session.id });

      if (error) {
        console.error("Failed to release the slot", error);
        return new Response("Could not release the slot.", { status: 500 });
      }
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
