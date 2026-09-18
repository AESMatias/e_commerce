import "server-only";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/** The visitor's language, preferring the saved choice over the browser language. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(value)) return value;

  const acceptedLanguages = (await headers()).get("accept-language") ?? "";
  const browserLocale = acceptedLanguages
    .split(",")
    .map((language) => (language.trim().split(";", 1)[0] ?? "").toLowerCase())
    .find((language) => language === "es" || language.startsWith("es-"));

  return browserLocale ? "es" : defaultLocale;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
