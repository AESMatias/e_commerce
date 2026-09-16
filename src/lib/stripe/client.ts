import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily created so a missing key only fails where Stripe is actually used. */
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing environment variable STRIPE_SECRET_KEY.");
  }

  // This project is a portfolio demo: checkout must always run in test mode,
  // so a live key is refused rather than silently charging a real card.
  if (secretKey.startsWith("sk_live_")) {
    throw new Error("A live Stripe key was provided, but this app only runs in test mode.");
  }

  client ??= new Stripe(secretKey);
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
