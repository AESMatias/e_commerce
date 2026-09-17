import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limiting for the AI advisor.
 *
 * Deliberately fail-closed: when a limit is hit, or the global counters cannot
 * be read, we reject the request instead of paying for more model calls.
 *   1. Per-IP short window (in memory): stops a single visitor from draining
 *      the quota. Best effort, since each server instance has its own counters.
 *   2. Global daily cap and global short window (in Supabase): the hard
 *      spending ceiling, shared by every instance and kept across deploys.
 */

const MINUTE = 60_000;

const IP_LIMIT = { limit: 10, windowMs: 5 * MINUTE };
const GLOBAL_DAILY_LIMIT = 1500;
const GLOBAL_WINDOW_LIMIT = { limit: 120, windowSeconds: 5 * 60 };

const LOGIN_LIMIT = { limit: 8, windowMs: 10 * MINUTE };

const MAX_TRACKED_IPS = 5000;

type Counter = { count: number; resetAt: number };

const counters = new Map<string, Counter>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; scope: "ip" | "global"; retryAfterSeconds: number };

function peek(key: string, limit: number, windowMs: number, now: number): Counter | null {
  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    return { count: 0, resetAt: now + windowMs };
  }
  return current.count >= limit ? null : current;
}

function sweep(now: number): void {
  for (const [key, counter] of counters) {
    if (counter.resetAt <= now) counters.delete(key);
  }
}

async function consumeGlobalQuota(): Promise<RateLimitResult> {
  const { data, error } = await createAdminClient().rpc("consume_advisor_quota", {
    p_daily_limit: GLOBAL_DAILY_LIMIT,
    p_window_limit: GLOBAL_WINDOW_LIMIT.limit,
    p_window_seconds: GLOBAL_WINDOW_LIMIT.windowSeconds,
  });

  if (error || typeof data !== "number") {
    console.error("[rate-limit] global quota check failed", error);
    return { ok: false, scope: "global", retryAfterSeconds: 60 };
  }

  return data === 0 ? { ok: true } : { ok: false, scope: "global", retryAfterSeconds: data };
}

export async function checkAdvisorRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();

  if (counters.size > MAX_TRACKED_IPS) sweep(now);

  // Check the IP limit before consuming global quota, and only count the
  // request against the IP once the global quota has accepted it.
  const key = `ip:${ip}`;
  const counter = peek(key, IP_LIMIT.limit, IP_LIMIT.windowMs, now);
  if (!counter) {
    const blocked = counters.get(key);
    const retryAfterSeconds = blocked ? Math.ceil((blocked.resetAt - now) / 1000) : 60;
    return { ok: false, scope: "ip", retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  const global = await consumeGlobalQuota();
  if (!global.ok) return global;

  counters.set(key, { count: counter.count + 1, resetAt: counter.resetAt });
  return { ok: true };
}

export type LimitUsage = { used: number; limit: number; resetsAt: Date };

export type AdvisorUsage = {
  daily: LimitUsage;
  window: LimitUsage & { windowMinutes: number };
  perIp: { limit: number; windowMinutes: number };
};

/**
 * Current use of the global advisor limits, for the admin panel. Bucket keys
 * mirror the ones built by consume_advisor_quota in the database.
 */
export async function getAdvisorUsage(): Promise<AdvisorUsage> {
  const now = Date.now();
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const windowMs = GLOBAL_WINDOW_LIMIT.windowSeconds * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;

  const dayKey = `day:${dayStart.toISOString().slice(0, 10)}`;
  const windowKey = `window:${windowStart / 1000}`;

  const { data, error } = await createAdminClient()
    .from("advisor_usage")
    .select("bucket, used")
    .in("bucket", [dayKey, windowKey]);

  if (error) throw new Error(`Could not load advisor usage: ${error.message}`);

  const usedIn = (key: string) => data.find((row) => row.bucket === key)?.used ?? 0;

  return {
    daily: {
      used: usedIn(dayKey),
      limit: GLOBAL_DAILY_LIMIT,
      resetsAt: new Date(dayStart.getTime() + 24 * 60 * MINUTE),
    },
    window: {
      used: usedIn(windowKey),
      limit: GLOBAL_WINDOW_LIMIT.limit,
      resetsAt: new Date(windowStart + windowMs),
      windowMinutes: GLOBAL_WINDOW_LIMIT.windowSeconds / 60,
    },
    perIp: { limit: IP_LIMIT.limit, windowMinutes: IP_LIMIT.windowMs / MINUTE },
  };
}

/** Throttles admin login attempts so the password cannot be brute forced. */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const key = `login:${ip}`;
  const counter = peek(key, LOGIN_LIMIT.limit, LOGIN_LIMIT.windowMs, now);

  if (!counter) {
    const blocked = counters.get(key);
    const retryAfterSeconds = blocked ? Math.ceil((blocked.resetAt - now) / 1000) : 60;
    return { ok: false, scope: "ip", retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  counters.set(key, { count: counter.count + 1, resetAt: counter.resetAt });
  return { ok: true };
}

/** Best-effort client IP from the proxy headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}
