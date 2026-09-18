import type { Locale } from "../config";
import { catalogEs } from "./es";

type ServiceTranslation = {
  name: string;
  tagline: string;
  description: string;
  idealFor: string;
};

type PackageTranslation = {
  name: string;
  summary: string;
  deliverables: string[];
};

export type CatalogTranslation = {
  services: Partial<Record<string, ServiceTranslation>>;
  packages: Partial<Record<string, PackageTranslation>>;
};

// English is the language stored in the database, so it needs no entries.
const catalogTranslations: Record<Locale, CatalogTranslation> = {
  en: { services: {}, packages: {} },
  es: catalogEs,
};

/** The translated text for a service, or undefined to keep the database text. */
export function serviceTranslation(slug: string, locale: Locale): ServiceTranslation | undefined {
  return catalogTranslations[locale].services[slug];
}

/** The translated text for a package, or undefined to keep the database text. */
export function packageTranslation(slug: string, locale: Locale): PackageTranslation | undefined {
  return catalogTranslations[locale].packages[slug];
}
