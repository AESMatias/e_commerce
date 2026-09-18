import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PaymentStatusRefresher } from "@/components/booking/PaymentStatusRefresher";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { packageTranslation, serviceTranslation } from "@/i18n/catalog";
import { interpolate } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { verifyAndConfirmBooking } from "@/lib/booking/confirm";
import { formatPrice, formatSlotRange, formatSlotTime } from "@/lib/format";
import { getBusinessTimezone } from "@/lib/scheduling";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.booking.metaTitle, robots: { index: false } };
}

function isHoldExpired(status: string, expiresAt: string): boolean {
  return status === "expired" || Date.parse(expiresAt) <= Date.now();
}

type BookingPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { bookingId } = await params;
  const { paid } = await searchParams;
  const { locale, t } = await getDictionary();
  const supabase = createAdminClient();

  // Stripe sends the visitor back here right after paying, usually before its
  // webhook arrives, so ask Stripe directly instead of making them wait.
  if (paid === "1") {
    await verifyAndConfirmBooking(bookingId);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, starts_at, ends_at, status, deposit_cents, currency, expires_at, customer_id, package_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) notFound();

  const [{ data: customer }, { data: servicePackage }, { data: payment }] = await Promise.all([
    supabase.from("customers").select("email").eq("id", booking.customer_id).maybeSingle(),
    supabase.from("service_packages").select("slug, name, service_id").eq("id", booking.package_id).maybeSingle(),
    supabase
      .from("payments")
      .select("status, stripe_checkout_url")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: service } = servicePackage
    ? await supabase.from("services").select("slug, name").eq("id", servicePackage.service_id).maybeSingle()
    : { data: null };

  const serviceName = service ? (serviceTranslation(service.slug, locale)?.name ?? service.name) : "";
  const packageName = servicePackage
    ? (packageTranslation(servicePackage.slug, locale)?.name ?? servicePackage.name)
    : "";

  const timezone = await getBusinessTimezone();
  const isScheduled = Boolean(booking.starts_at && booking.ends_at);
  const isConfirmed = booking.status === "confirmed";
  const isReleased = !isConfirmed && (isHoldExpired(booking.status, booking.expires_at) || booking.status === "cancelled");
  // Stripe redirects back before its webhook usually lands, so a just-paid
  // booking may still look pending for a second or two.
  const isAwaitingWebhook = !isConfirmed && !isReleased && paid === "1";

  const copy = t.booking;

  const heading = isConfirmed
    ? isScheduled
      ? copy.headingConfirmedScheduled
      : copy.headingConfirmedUnscheduled
    : isReleased
      ? isScheduled
        ? copy.headingReleasedScheduled
        : copy.headingReleasedUnscheduled
      : isAwaitingWebhook
        ? copy.headingAwaiting
        : isScheduled
          ? copy.headingHeldScheduled
          : copy.headingHeldUnscheduled;

  const eyebrow = isConfirmed
    ? copy.eyebrowConfirmed
    : isReleased
      ? copy.eyebrowReleased
      : isAwaitingWebhook
        ? copy.eyebrowAwaiting
        : copy.eyebrowPending;

  return (
    <Container className={styles.page}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{heading}</h1>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.label}>{copy.kickoffCall}</dt>
            <dd className={styles.value}>
              {isScheduled
                ? formatSlotRange(booking.starts_at ?? "", booking.ends_at ?? "", timezone, locale)
                : copy.toBeArranged}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>{copy.package}</dt>
            <dd className={styles.value}>
              {serviceName} {packageName}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>{isConfirmed ? copy.depositPaid : copy.depositDue}</dt>
            <dd className={styles.value}>{formatPrice(booking.deposit_cents, booking.currency, locale)}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>{copy.bookedBy}</dt>
            <dd className={styles.value}>{customer?.email}</dd>
          </div>
        </dl>

        {isConfirmed && (
          <>
            <p className={styles.note}>
              {isScheduled ? copy.confirmedScheduledNote : copy.confirmedUnscheduledNote}
            </p>
            <p className={styles.note}>{copy.keepPage}</p>
            <Button asChild className={styles.homeButton}>
              <Link href="/">{copy.backHome}</Link>
            </Button>
          </>
        )}

        {isReleased && (
          <>
            <p className={styles.note}>{copy.releasedNote}</p>
            <Button asChild>
              <Link href="/#services">{copy.chooseAnother}</Link>
            </Button>
          </>
        )}

        {isAwaitingWebhook && (
          <>
            <p className={styles.note}>{copy.awaitingNote}</p>
            <PaymentStatusRefresher />
          </>
        )}

        {!isConfirmed && !isReleased && !isAwaitingWebhook && (
          <>
            <p className={styles.note}>
              {interpolate(isScheduled ? copy.heldScheduledUntil : copy.heldUnscheduledUntil, {
                time: formatSlotTime(booking.expires_at, timezone, locale),
              })}
            </p>
            {payment?.stripe_checkout_url ? (
              <Button asChild>
                <a href={payment.stripe_checkout_url}>{copy.payDeposit}</a>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/#services">{copy.startAgain}</Link>
              </Button>
            )}
          </>
        )}
      </article>
    </Container>
  );
}
