import "server-only";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database";

type CreateCheckoutInput = {
  booking: Tables<"bookings">;
  customerEmail: string;
  productName: string;
  productDescription: string;
  origin: string;
};

/**
 * Creates the Stripe Checkout session for a booking deposit and records it in
 * `payments`. The session expires exactly when our slot hold does, so an
 * abandoned checkout cannot be paid after the slot has been released.
 */
export async function createDepositCheckout(input: CreateCheckoutInput): Promise<string> {
  const stripe = getStripe();
  const { booking } = input;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: booking.id,
    expires_at: Math.floor(Date.parse(booking.expires_at) / 1000),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: booking.deposit_cents,
          product_data: {
            name: input.productName,
            description: input.productDescription,
          },
        },
      },
    ],
    metadata: { booking_id: booking.id },
    payment_intent_data: { metadata: { booking_id: booking.id } },
    success_url: `${input.origin}/booking/${booking.id}?paid=1`,
    cancel_url: `${input.origin}/booking/${booking.id}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("payments").insert({
    booking_id: booking.id,
    stripe_checkout_session_id: session.id,
    stripe_checkout_url: session.url,
    amount_cents: booking.deposit_cents,
    currency: booking.currency,
  });

  if (error) {
    throw new Error(`Failed to record the payment: ${error.message}`);
  }

  return session.url;
}
