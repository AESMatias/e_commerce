import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Least-privilege client (publishable key, RLS enforced).
 * Use it for public reads: the catalog and available slots.
 */
export function createPublicClient() {
  return createClient<Database>(serverEnv.supabaseUrl, serverEnv.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
