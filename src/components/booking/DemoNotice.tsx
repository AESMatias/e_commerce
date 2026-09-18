"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { cx } from "@/lib/cx";
import styles from "./DemoNotice.module.css";

const TEST_CARD = "4242 4242 4242 4242";

export function DemoNotice({ className }: { className?: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(TEST_CARD.replaceAll(" ", ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className={cx(styles.notice, className)}>
      <p className={styles.badge}>{t.demo.badge}</p>

      <p className={styles.text}>
        {t.demo.textBefore}
        <strong className={styles.strong}>{t.demo.textStrong}</strong>
        {t.demo.textAfter}
      </p>

      <div className={styles.card}>
        <span className={styles.cardNumber}>{TEST_CARD}</span>
        <button type="button" className={styles.copy} onClick={copyCard}>
          {copied ? t.common.copied : t.common.copy}
        </button>
      </div>

      <p className={styles.hint}>{t.demo.hint}</p>
    </aside>
  );
}
