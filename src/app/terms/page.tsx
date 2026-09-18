import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { termsEn } from "./content/en";
import { termsEs } from "./content/es";

const content = { en: termsEn, es: termsEs };

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();

  return {
    title: t.legal.termsTitle,
    description: interpolate(t.legal.termsDescription, { name: siteConfig.name }),
  };
}

export default async function TermsPage() {
  const { locale, t } = await getDictionary();
  const { intro, body } = content[locale];

  return (
    <LegalDocument title={t.legal.termsTitle} updated={siteConfig.legalUpdated} intro={intro}>
      {body}
    </LegalDocument>
  );
}
