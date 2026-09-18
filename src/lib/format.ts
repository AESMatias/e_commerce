import { defaultLocale, interpolate, intlLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

/** Prices are stored in cents (Stripe's convention) and formatted for display. */
export function formatPrice(cents: number, currency = "usd", locale: Locale = defaultLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatTimeline(minWeeks: number, maxWeeks: number, locale: Locale = defaultLocale): string {
  const t = dictionaries[locale].format;
  if (minWeeks === maxWeeks) {
    return minWeeks === 1 ? t.week : interpolate(t.weeks, { count: minWeeks });
  }
  return interpolate(t.weekRange, { min: minWeeks, max: maxWeeks });
}

const SLOT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

export function formatSlotDate(iso: string, timeZone?: string, locale: Locale = defaultLocale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { ...SLOT_DATE_OPTIONS, timeZone }).format(new Date(iso));
}

export function formatSlotTime(iso: string, timeZone?: string, locale: Locale = defaultLocale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(iso),
  );
}

/** "Monday, October 5 · 9:00 AM – 9:30 AM (GMT-3)" */
export function formatSlotRange(
  startsAt: string,
  endsAt: string,
  timeZone?: string,
  locale: Locale = defaultLocale,
): string {
  const zoneParts = new Intl.DateTimeFormat(intlLocale(locale), { timeZone, timeZoneName: "short" }).formatToParts(
    new Date(startsAt),
  );
  const zoneName = zoneParts.find((part) => part.type === "timeZoneName")?.value ?? "";
  const range = `${formatSlotTime(startsAt, timeZone, locale)} – ${formatSlotTime(endsAt, timeZone, locale)}`;
  return `${formatSlotDate(startsAt, timeZone, locale)} · ${range}${zoneName ? ` (${zoneName})` : ""}`;
}

export function formatDurationMinutes(startsAt: string, endsAt: string): string {
  const minutes = Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60000);
  return `${minutes} min`;
}

/** A calendar date such as the legal pages' "last updated", from YYYY-MM-DD. */
export function formatLongDate(isoDate: string, locale: Locale = defaultLocale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
