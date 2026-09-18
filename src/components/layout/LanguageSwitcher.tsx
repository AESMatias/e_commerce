"use client";

import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";
import styles from "./LanguageSwitcher.module.css";

const LABELS: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  es: { short: "ES", name: "Español" },
};

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={label} className={styles.switcher} aria-busy={pending}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          className={styles.option}
          aria-pressed={locale === current}
          title={LABELS[locale].name}
          disabled={pending}
          onClick={() => {
            if (locale !== current) startTransition(() => setLocale(locale));
          }}
        >
          {LABELS[locale].short}
        </button>
      ))}
    </div>
  );
}
