"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/catalog";
import { ServiceDetailsDialog } from "./ServiceDetailsDialog";
import { ServiceIcon } from "./ServiceIcon";
import styles from "./ServiceCard.module.css";

/** How long the white corner light takes to pull back in. */
const RETREAT_MS = 430;

export function ServiceCard({ service }: { service: Service }) {
  // CSS alone cannot tell "entering" from "leaving", and the two states are
  // meant to look different: blue along the sides on the way in, white
  // retreating into the corners on the way out. This flag marks the way out.
  const [isLeaving, setIsLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handleEnter() {
    window.clearTimeout(timer.current);
    setIsLeaving(false);
  }

  function handleLeave() {
    setIsLeaving(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsLeaving(false), RETREAT_MS);
  }

  return (
    <article
      className={styles.card}
      data-leaving={isLeaving ? "true" : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className={styles.icon}>
        <ServiceIcon name={service.icon} />
      </div>
      <h3 className={styles.name}>{service.name}</h3>
      <p className={styles.tagline}>{service.tagline}</p>

      <div className={styles.meta}>
        <p className={styles.price}>
          <span className={styles.priceLabel}>From</span>
          {formatPrice(service.startingPriceCents, service.currency)}
        </p>
        <p className={styles.packageCount}>{service.packages.length} packages</p>
      </div>

      <ServiceDetailsDialog service={service} />
    </article>
  );
}
