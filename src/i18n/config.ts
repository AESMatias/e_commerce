export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * The regional variant used for numbers and dates. Prices are in USD, and
 * es-US keeps the familiar "$2,500" instead of "2500 US$".
 */
const INTL_LOCALES: Record<Locale, string> = { en: "en-US", es: "es-US" };

export function intlLocale(locale: Locale): string {
  return INTL_LOCALES[locale];
}

/** Fills {placeholders} in a dictionary string: interpolate("Hi {name}", { name: "Ana" }). */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
