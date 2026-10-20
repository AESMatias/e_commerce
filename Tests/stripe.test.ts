import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isStripeConfigured, getStripe } from "@/lib/stripe/client";
import { POST as handleStripeWebhook } from "@/app/api/stripe/webhook/route";

describe("Stripe client configuration", () => {
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.STRIPE_SECRET_KEY = originalEnv;
    } else {
      delete process.env.STRIPE_SECRET_KEY;
    }
  });

  it("reports as not configured when STRIPE_SECRET_KEY is unset", () => {
    expect(isStripeConfigured()).toBe(false);
  });

  it("reports as configured when a secret key is present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123456789";
    expect(isStripeConfigured()).toBe(true);
  });

  it("throws when getStripe is called without a secret key", () => {
    expect(() => getStripe()).toThrow(/Missing environment variable STRIPE_SECRET_KEY/);
  });

  it("refuses live secret keys to prevent accidental real charges", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_123456789";
    expect(() => getStripe()).toThrow(/only runs in test mode/);
  });
});

describe("Stripe webhook endpoint", () => {
  const originalSecret = process.env.STRIPE_SECRET_KEY;
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalSecret;
    process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it("returns 503 when Stripe or webhook secret is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await handleStripeWebhook(request);
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("Stripe is not configured.");
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123456";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123456";

    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await handleStripeWebhook(request);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Missing stripe-signature header.");
  });

  it("returns 400 when stripe-signature is invalid", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123456";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123456";

    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      headers: {
        "stripe-signature": "t=123,v1=invalid_sig",
      },
      body: JSON.stringify({ id: "evt_test" }),
    });

    const response = await handleStripeWebhook(request);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid signature.");
  });
});
