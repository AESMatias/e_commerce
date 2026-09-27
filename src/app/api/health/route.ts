import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Health check: confirms the app is up and the database answers, by reading
 * one row of the public catalog (publishable key, RLS applies). Vercel Cron
 * calls it once a day (see vercel.json); uptime monitors can call it too.
 */
export async function GET() {
  const checkedAt = new Date().toISOString();
  const { error } = await createPublicClient().from("services").select("id").limit(1);

  if (error) {
    return NextResponse.json({ status: "error", database: "unreachable", checkedAt }, { status: 503 });
  }
  return NextResponse.json({ status: "ok", database: "ok", checkedAt });
}
