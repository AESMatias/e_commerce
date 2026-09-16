import "server-only";

/**
 * In-memory rate limiting for the AI advisor.
 *
 * Deliberately fail-closed: when a limit is hit we reject the request instead
 * of paying for more model calls. Three limits apply in order:
 *   1. a global daily cap (hard spending ceiling),
 *   2. a global short window (absorbs bursts / DDoS attempts),
 *   3. a per-IP short window (stops a single visitor from draining the quota).
 *
 * Counters live in the process memory, so each server instance has its own.
 * That is fine for a single instance; move to Redis (Upstash) if the app is
 * ever deployed to several instances.
 */

const MINUTE = 60_000;

const IP_LIMIT = { limit: 10, windowMs: 5 * MINUTE };
const GLOBAL_LIMIT = { limit: 120, windowMs: 5 * MINUTE };
const GLOBAL_DAILY_LIMIT = { limit: 1500, windowMs: 24 * 60 * MINUTE };

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

export function checkAdvisorRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  if (counters.size > MAX_TRACKED_IPS) sweep(now);

  const checks = [
    { key: "global:day", ...GLOBAL_DAILY_LIMIT, scope: "global" as const },
    { key: "global:window", ...GLOBAL_LIMIT, scope: "global" as const },
    { key: `ip:${ip}`, ...IP_LIMIT, scope: "ip" as const },
  ];

  // Check every limit before consuming any, so a rejected request does not
  // burn quota from the limits that would have allowed it.
  const pending: Array<{ key: string; counter: Counter }> = [];
  for (const check of checks) {
    const counter = peek(check.key, check.limit, check.windowMs, now);
    if (!counter) {
      const blocked = counters.get(check.key);
      const retryAfterSeconds = blocked ? Math.ceil((blocked.resetAt - now) / 1000) : 60;
      return { ok: false, scope: check.scope, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
    }
    pending.push({ key: check.key, counter });
  }

  for (const { key, counter } of pending) {
    counters.set(key, { count: counter.count + 1, resetAt: counter.resetAt });
  }

  return { ok: true };
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
