"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <p className={styles.timeout}>
        This is taking longer than usual. Your payment is safe — reload this page in a minute to
        see whether the time was secured.
      </p>
    );
  }

  return (
    <span className={styles.spinner} role="status" aria-label="Confirming your payment">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
