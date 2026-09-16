/** Prices are stored in cents (Stripe's convention) and formatted for display. */
export function formatPrice(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatTimeline(minWeeks: number, maxWeeks: number): string {
  if (minWeeks === maxWeeks) {
    return minWeeks === 1 ? "1 week" : `${minWeeks} weeks`;
  }
  return `${minWeeks}–${maxWeeks} weeks`;
}

const SLOT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

export function formatSlotDate(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", { ...SLOT_DATE_OPTIONS, timeZone }).format(new Date(iso));
}

export function formatSlotTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(iso),
  );
}

/** "Monday, October 5 · 9:00 AM – 9:30 AM (GMT-3)" */
export function formatSlotRange(startsAt: string, endsAt: string, timeZone?: string): string {
  const zoneParts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(
    new Date(startsAt),
  );
  const zoneName = zoneParts.find((part) => part.type === "timeZoneName")?.value ?? "";
  const range = `${formatSlotTime(startsAt, timeZone)} – ${formatSlotTime(endsAt, timeZone)}`;
  return `${formatSlotDate(startsAt, timeZone)} · ${range}${zoneName ? ` (${zoneName})` : ""}`;
}

export function formatDurationMinutes(startsAt: string, endsAt: string): string {
  const minutes = Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60000);
  return `${minutes} min`;
}
