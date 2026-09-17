import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import styles from "./LegalDocument.module.css";

type LegalDocumentProps = {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
};

/** Shared layout for the privacy policy and the terms of service. */
export function LegalDocument({ title, updated, intro, children }: LegalDocumentProps) {
  return (
    <Container className={styles.page}>
      <article className={styles.article}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>
            ← Back to home
          </Link>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.updated}>Last updated: {updated}</p>
          <div className={styles.intro}>{intro}</div>
        </header>
        <div className={styles.body}>{children}</div>
      </article>
    </Container>
  );
}
