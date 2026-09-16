import "server-only";
import { sendBookingConfirmedEmails } from "@/lib/booking/notifications";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Confirms a booking straight from Stripe when the visitor returns from
 * checkout, instead of waiting for the webhook.
 *
 * The webhook is still the safety net for visitors who close the tab, and both
 * paths funnel into the same database function, which only confirms once.
 */
export async function verifyAndConfirmBooking(bookingId: string): Promise<boolean> {
  if (!isStripeConfigured()) return false;

  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("stripe_checkout_session_id, status")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment || payment.status === "paid") return false;

  try {
    const session = await getStripe().checkout.sessions.retrieve(payment.stripe_checkout_session_id);
    if (session.payment_status !== "paid") return false;

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

    const { data: result, error } = await supabase.rpc("confirm_booking_payment", {
      p_session_id: session.id,
      p_payment_intent_id: paymentIntentId ?? undefined,
    });

    if (error) {
      console.error("Failed to confirm booking from the return page", error);
      return false;
    }

    if (result === "confirmed") {
      await sendBookingConfirmedEmails(bookingId);
      return true;
    }

    if (result === "slot_conflict") {
      console.error(`Paid session ${session.id} could not be confirmed: the slot was taken.`);
    }

    return false;
  } catch (stripeError) {
    console.error("Could not read the checkout session from Stripe", stripeError);
    return false;
  }
}
