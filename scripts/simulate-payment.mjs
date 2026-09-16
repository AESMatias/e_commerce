/**
 * Simulates the Stripe webhook locally, so you can test the booking flow
 * without installing the Stripe CLI.
 *
 * It takes the most recent pending payment from the database, builds the same
 * event Stripe would send, signs it with STRIPE_WEBHOOK_SECRET and posts it to
 * the running dev server.
 *
 *   node scripts/simulate-payment.mjs            # confirm the payment
 *   node scripts/simulate-payment.mjs --expire   # release the slot instead
 *
 * Only for local development: in production Stripe calls the endpoint itself.
 */
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split("\n")
        .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
        .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
    );
  } catch {
    return {};
  }
}

const env = { ...readEnvFile(".env.local"), ...process.env };
const webhookUrl = env.WEBHOOK_URL ?? "http://localhost:3000/api/stripe/webhook";
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
const shouldExpire = process.argv.includes("--expire");

if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

if (!webhookSecret) {
  console.error("Missing STRIPE_WEBHOOK_SECRET in .env.local (any value works locally).");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const { data: payment, error } = await supabase
  .from("payments")
  .select("stripe_checkout_session_id, amount_cents, currency, status, booking_id")
  .eq("status", "pending")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (error) {
  console.error("Could not read payments:", error.message);
  process.exit(1);
}

if (!payment) {
  console.error("No pending payment found. Start a booking first, then run this script.");
  process.exit(1);
}

const event = shouldExpire
  ? {
      id: `evt_sim_${randomUUID()}`,
      object: "event",
      type: "checkout.session.expired",
      data: { object: { id: payment.stripe_checkout_session_id, object: "checkout_session" } },
    }
  : {
      id: `evt_sim_${randomUUID()}`,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: payment.stripe_checkout_session_id,
          object: "checkout_session",
          payment_status: "paid",
          payment_intent: `pi_sim_${randomUUID().slice(0, 12)}`,
          amount_total: payment.amount_cents,
          currency: payment.currency,
        },
      },
    };

const body = JSON.stringify(event);
const timestamp = Math.floor(Date.now() / 1000);
const signature = createHmac("sha256", webhookSecret).update(`${timestamp}.${body}`).digest("hex");

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "stripe-signature": `t=${timestamp},v1=${signature}`,
  },
  body,
});

console.log(`${event.type} -> ${response.status} ${await response.text()}`);

const { data: booking } = await supabase
  .from("bookings")
  .select("id, status, confirmed_at")
  .eq("id", payment.booking_id)
  .maybeSingle();

console.log("booking", booking?.id, "is now", booking?.status);
