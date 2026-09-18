import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { formatLongDate } from "@/lib/format";
import styles from "./LegalDocument.module.css";

type LegalDocumentProps = {
  title: string;
  /** YYYY-MM-DD */
  updated: string;
  intro: ReactNode;
  children: ReactNode;
};

/** Shared layout for the privacy policy and the terms of service. */
export async function LegalDocument({ title, updated, intro, children }: LegalDocumentProps) {
  const { locale, t } = await getDictionary();

  return (
    <Container className={styles.page}>
      <article className={styles.article}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>
            {t.legal.backHome}
          </Link>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.updated}>
            {interpolate(t.legal.lastUpdated, { date: formatLongDate(updated, locale) })}
          </p>
          <div className={styles.intro}>{intro}</div>
        </header>
        <div className={styles.body}>{children}</div>
      </article>
    </Container>
  );
}
