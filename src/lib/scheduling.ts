import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

export type AvailableSlot = {
  startsAt: string;
  endsAt: string;
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Free slots for the whole booking horizon. The database generates them from
 * the weekly rules and already removes past, blocked and taken times; it also
 * caps the range at scheduling_settings.max_days_ahead.
 */
export async function getAvailableSlots(): Promise<AvailableSlot[]> {
  const supabase = createPublicClient();
  const today = new Date();
  const horizon = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase.rpc("get_available_slots", {
    p_from: isoDate(today),
    p_to: isoDate(horizon),
  });

  if (error) {
    throw new Error(`Failed to load available slots: ${error.message}`);
  }

  return data.map((slot) => ({ startsAt: slot.starts_at, endsAt: slot.ends_at }));
}

/** Business timezone, used to display times consistently on the server. */
export async function getBusinessTimezone(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("scheduling_settings").select("timezone").single();

  if (error || !data) return "UTC";
  return data.timezone;
}
