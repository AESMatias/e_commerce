"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  createSessionValue,
  hasAdminSession,
  isAdminConfigured,
  isValidPassword,
  sessionCookieOptions,
} from "@/lib/admin/session";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export type LoginState = { error?: string };

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const { t } = await getDictionary();

  if (!isAdminConfigured()) {
    return { error: t.admin.notConfigured };
  }

  const headerList = await headers();
  const rateLimit = checkLoginRateLimit(getClientIp(new Request("http://local", { headers: headerList })));
  if (!rateLimit.ok) {
    return { error: interpolate(t.admin.tooManyAttempts, { seconds: rateLimit.retryAfterSeconds }) };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !isValidPassword(password)) {
    return { error: t.admin.wrongPassword };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionValue(), sessionCookieOptions);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  if (!(await hasAdminSession())) redirect("/admin/login");

  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || bookingId.length === 0) return;

  const supabase = createAdminClient();
  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);

  revalidatePath("/admin");
}
