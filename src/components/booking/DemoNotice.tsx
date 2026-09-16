"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import styles from "./DemoNotice.module.css";

const TEST_CARD = "4242 4242 4242 4242";

export function DemoNotice({ className }: { className?: string }) {
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
      <p className={styles.badge}>Demo environment</p>

      <p className={styles.text}>
        Checkout runs in Stripe test mode, so <strong className={styles.strong}>no money is
        charged</strong>. Pay with the test card below to see the full flow — your kickoff call is
        then booked for real.
      </p>

      <div className={styles.card}>
        <span className={styles.cardNumber}>{TEST_CARD}</span>
        <button type="button" className={styles.copy} onClick={copyCard}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className={styles.hint}>Any future expiry date, any CVC, any postal code.</p>
    </aside>
  );
}
