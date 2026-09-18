import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { DemoNotice } from "@/components/booking/DemoNotice";
import { Container } from "@/components/layout/Container";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { getPackageBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getAvailableSlots } from "@/lib/scheduling";
import styles from "./page.module.css";

// Availability changes constantly, so this page is always rendered on request.
export const dynamic = "force-dynamic";

type BookPageProps = {
  params: Promise<{ packageSlug: string }>;
};

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { packageSlug } = await params;
  const { locale, t } = await getDictionary();
  const found = await getPackageBySlug(packageSlug, locale);

  if (!found) return { title: t.book.notFoundTitle };

  return {
    title: interpolate(t.book.metaTitle, { name: `${found.service.name} ${found.servicePackage.name}` }),
    description: found.servicePackage.summary,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { packageSlug } = await params;
  const { locale, t } = await getDictionary();
  const found = await getPackageBySlug(packageSlug, locale);

  if (!found) notFound();

  const { service, servicePackage } = found;
  const slots = await getAvailableSlots();

  const selection = (
    <aside className={styles.summary}>
      <p className={styles.summaryEyebrow}>{t.book.selection}</p>
      <h2 className={styles.summaryTitle}>
        {service.name}
        <span className={styles.summaryTier}>{servicePackage.name}</span>
      </h2>
      <p className={styles.summaryText}>{servicePackage.summary}</p>

      <dl className={styles.summaryFacts}>
        <div className={styles.summaryFact}>
          <dt className={styles.summaryLabel}>{t.book.projectPrice}</dt>
          <dd className={styles.summaryValue}>
            {formatPrice(servicePackage.priceCents, servicePackage.currency, locale)}
          </dd>
        </div>
        <div className={styles.summaryFact}>
          <dt className={styles.summaryLabel}>{t.book.dueNow}</dt>
          <dd className={styles.summaryValue}>
            {formatPrice(servicePackage.depositCents, servicePackage.currency, locale)}
          </dd>
        </div>
        <div className={styles.summaryFact}>
          <dt className={styles.summaryLabel}>{t.book.timeline}</dt>
          <dd className={styles.summaryValue}>{servicePackage.timeline}</dd>
        </div>
      </dl>

      <p className={styles.summaryNote}>{t.book.note}</p>
    </aside>
  );

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <Link href="/#services" className={styles.back}>
          {t.book.back}
        </Link>
        <h1 className={styles.title}>{t.book.title}</h1>
        <p className={styles.subtitle}>{t.book.subtitle}</p>
      </header>

      <div className={styles.layout}>
        {/* Narrow screens show the selection and the demo notice inside the
            form; wide screens keep them in the sticky side column. */}
        <BookingScheduler
          packageSlug={servicePackage.slug}
          slots={slots}
          summary={selection}
          notice={<DemoNotice />}
        />

        <div className={styles.aside}>
          <DemoNotice />
          {selection}
        </div>
      </div>
    </Container>
  );
}
