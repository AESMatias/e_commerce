import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import type { PackageRecommendation } from "@/types/advisor";
import styles from "./PackageRecommendationCard.module.css";

export function PackageRecommendationCard({
  recommendation,
}: {
  recommendation: PackageRecommendation;
}) {
  const { t } = useI18n();

  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>{t.advisor.card.eyebrow}</p>

      <h3 className={styles.title}>
        {recommendation.serviceName} · {recommendation.packageName}
      </h3>
      <p className={styles.reasoning}>{recommendation.reasoning}</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>{t.advisor.card.price}</dt>
          <dd className={styles.factValue}>{recommendation.price}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>{t.advisor.card.deposit}</dt>
          <dd className={styles.factValue}>{recommendation.deposit}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>{t.advisor.card.timeline}</dt>
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
        <Link href={recommendation.bookingHref}>{t.advisor.card.cta}</Link>
      </Button>
    </article>
  );
}
