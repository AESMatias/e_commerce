import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "devstudio_admin";

const SESSION_DAYS = 7;

function secret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length >= 8 ? password : null;
}

function sign(expiresAt: number, key: string): string {
  return createHmac("sha256", key).update(`admin.${expiresAt}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function isAdminConfigured(): boolean {
  return secret() !== null;
}

/** Checks the password without leaking its length through timing. */
export function isValidPassword(candidate: string): boolean {
  const key = secret();
  return key !== null && safeEqual(candidate, key);
}

/**
 * The cookie holds an expiry plus its signature. The signing key is the
 * password itself, so changing the password invalidates every session.
 */
export function createSessionValue(): string {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set.");

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

export function isValidSessionValue(value: string | undefined): boolean {
  const key = secret();
  if (!key || !value) return false;

  const [expiresPart, signature] = value.split(".");
  const expiresAt = Number(expiresPart);

  if (!expiresPart || !signature || !Number.isFinite(expiresAt)) return false;
  if (expiresAt < Date.now()) return false;

  return safeEqual(signature, sign(expiresAt, key));
}

export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
} as const;
