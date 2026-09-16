import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { DemoNotice } from "@/components/booking/DemoNotice";
import { Container } from "@/components/layout/Container";
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
  const found = await getPackageBySlug(packageSlug);

  if (!found) return { title: "Package not found" };

  return {
    title: `Book a kickoff call · ${found.service.name} ${found.servicePackage.name}`,
    description: found.servicePackage.summary,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { packageSlug } = await params;
  const found = await getPackageBySlug(packageSlug);

  if (!found) notFound();

  const { service, servicePackage } = found;
  const slots = await getAvailableSlots();

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <Link href="/#services" className={styles.back}>
          ← Back to packages
        </Link>
        <h1 className={styles.title}>Book your kickoff call</h1>
        <p className={styles.subtitle}>
          A 30-minute call to scope your project. Your slot is confirmed once the deposit is paid.
        </p>
      </header>

      <div className={styles.layout}>
        <BookingScheduler packageSlug={servicePackage.slug} slots={slots} />

        <div className={styles.aside}>
          <DemoNotice />

          <aside className={styles.summary}>
            <p className={styles.summaryEyebrow}>Your selection</p>
            <h2 className={styles.summaryTitle}>
              {service.name}
              <span className={styles.summaryTier}>{servicePackage.name}</span>
            </h2>
            <p className={styles.summaryText}>{servicePackage.summary}</p>

            <dl className={styles.summaryFacts}>
              <div className={styles.summaryFact}>
                <dt className={styles.summaryLabel}>Project price</dt>
                <dd className={styles.summaryValue}>
                  {formatPrice(servicePackage.priceCents, servicePackage.currency)}
                </dd>
              </div>
              <div className={styles.summaryFact}>
                <dt className={styles.summaryLabel}>Due now (deposit)</dt>
                <dd className={styles.summaryValue}>
                  {formatPrice(servicePackage.depositCents, servicePackage.currency)}
                </dd>
              </div>
              <div className={styles.summaryFact}>
                <dt className={styles.summaryLabel}>Timeline</dt>
                <dd className={styles.summaryValue}>{servicePackage.timeline}</dd>
              </div>
            </dl>

            <p className={styles.summaryNote}>
              Final scope and price are confirmed on the call before any further work starts.
            </p>
          </aside>
        </div>
      </div>
    </Container>
  );
}
