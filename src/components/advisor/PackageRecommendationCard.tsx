import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { PackageRecommendation } from "@/types/advisor";
import styles from "./PackageRecommendationCard.module.css";

export function PackageRecommendationCard({
  recommendation,
}: {
  recommendation: PackageRecommendation;
}) {
  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>Recommended package</p>

      <h3 className={styles.title}>
        {recommendation.serviceName} · {recommendation.packageName}
      </h3>
      <p className={styles.reasoning}>{recommendation.reasoning}</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Price</dt>
          <dd className={styles.factValue}>{recommendation.price}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Deposit</dt>
          <dd className={styles.factValue}>{recommendation.deposit}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Timeline</dt>
          <dd className={styles.factValue}>{recommendation.timeline}</dd>
        </div>
      </dl>

      <ul role="list" className={styles.deliverables}>
        {recommendation.deliverables.slice(0, 4).map((item) => (
          <li key={item} className={styles.deliverable}>
            {item}
          </li>
        ))}
      </ul>

      <Button asChild size="sm" className={styles.cta}>
        <Link href={recommendation.bookingHref}>Book kickoff call</Link>
      </Button>
    </article>
  );
}
