import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Privileged client (secret key, bypasses RLS).
 * Server-only: bookings, customers, payments and Stripe webhooks.
 */
export function createAdminClient() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
