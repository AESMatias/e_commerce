import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { privacyEn } from "./content/en";
import { privacyEs } from "./content/es";

const content = { en: privacyEn, es: privacyEs };

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();

  return {
    title: t.legal.privacyTitle,
    description: interpolate(t.legal.privacyDescription, { name: siteConfig.name }),
  };
}

export default async function PrivacyPage() {
  const { locale, t } = await getDictionary();
  const { intro, body } = content[locale];

  return (
    <LegalDocument title={t.legal.privacyTitle} updated={siteConfig.legalUpdated} intro={intro}>
      {body}
    </LegalDocument>
  );
}
