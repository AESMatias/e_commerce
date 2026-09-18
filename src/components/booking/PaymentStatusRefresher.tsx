"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./PaymentStatusRefresher.module.css";

const INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 8;

/**
 * Safety net for the rare case where the payment is not confirmed by the time
 * the visitor lands here: poll a few times, then stop and say so instead of
 * spinning forever.
 */
export function PaymentStatusRefresher() {
  const router = useRouter();
  const { t } = useI18n();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let attempts = 0;

    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(timer);
        setGaveUp(true);
        return;
      }
      router.refresh();
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [router]);

  if (gaveUp) {
    return (
      <p className={styles.timeout}>{t.booking.refreshTimeout}</p>
    );
  }

  return (
    <span className={styles.spinner} role="status" aria-label={t.booking.confirming}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
