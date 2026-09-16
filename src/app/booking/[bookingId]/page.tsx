import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PaymentStatusRefresher } from "@/components/booking/PaymentStatusRefresher";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { verifyAndConfirmBooking } from "@/lib/booking/confirm";
import { formatPrice, formatSlotRange, formatSlotTime } from "@/lib/format";
import { getBusinessTimezone } from "@/lib/scheduling";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false },
};

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
    supabase.from("service_packages").select("name, service_id").eq("id", booking.package_id).maybeSingle(),
    supabase
      .from("payments")
      .select("status, stripe_checkout_url")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: service } = servicePackage
    ? await supabase.from("services").select("name").eq("id", servicePackage.service_id).maybeSingle()
    : { data: null };

  const timezone = await getBusinessTimezone();
  const isScheduled = Boolean(booking.starts_at && booking.ends_at);
  const isConfirmed = booking.status === "confirmed";
  const isReleased = !isConfirmed && (isHoldExpired(booking.status, booking.expires_at) || booking.status === "cancelled");
  // Stripe redirects back before its webhook usually lands, so a just-paid
  // booking may still look pending for a second or two.
  const isAwaitingWebhook = !isConfirmed && !isReleased && paid === "1";

  const heading = isConfirmed
    ? isScheduled
      ? "Your kickoff call is booked"
      : "Your package is booked"
    : isReleased
      ? isScheduled
        ? "This time is no longer held"
        : "This booking was released"
      : isAwaitingWebhook
        ? "Confirming your payment…"
        : isScheduled
          ? "Your time is held"
          : "Your booking is held";

  const eyebrow = isConfirmed
    ? "Confirmed"
    : isReleased
      ? "Hold expired"
      : isAwaitingWebhook
        ? "Almost done"
        : "Awaiting payment";

  return (
    <Container className={styles.page}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{heading}</h1>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.label}>Kickoff call</dt>
            <dd className={styles.value}>
              {isScheduled
                ? formatSlotRange(booking.starts_at ?? "", booking.ends_at ?? "", timezone)
                : "To be arranged"}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>Package</dt>
            <dd className={styles.value}>
              {service?.name} {servicePackage?.name}
            </dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>{isConfirmed ? "Deposit paid" : "Deposit due"}</dt>
            <dd className={styles.value}>{formatPrice(booking.deposit_cents, booking.currency)}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.label}>Booked by</dt>
            <dd className={styles.value}>{customer?.email}</dd>
          </div>
        </dl>

        {isConfirmed && (
          <>
            <p className={styles.note}>
              {isScheduled
                ? "The time above is now reserved for you — nobody else can take it. This was a Stripe test payment, so nothing was charged."
                : "Your package is booked without a time. Contact us whenever you are ready and we will agree on one. This was a Stripe test payment, so nothing was charged."}
            </p>
            <p className={styles.note}>
              Keep this page: it is the record of your booking. No confirmation email is sent.
            </p>
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </>
        )}

        {isReleased && (
          <>
            <p className={styles.note}>
              The deposit was not paid in time, so this booking was released and the time is
              available to others again. You can start over whenever you are ready.
            </p>
            <Button asChild>
              <Link href="/#services">Choose another time</Link>
            </Button>
          </>
        )}

        {isAwaitingWebhook && (
          <>
            <p className={styles.note}>
              Stripe has your payment and we are confirming the booking. This page updates on its
              own in a few seconds and tells you whether the time was secured.
            </p>
            <PaymentStatusRefresher />
          </>
        )}

        {!isConfirmed && !isReleased && !isAwaitingWebhook && (
          <>
            <p className={styles.note}>
              {isScheduled ? "This time is held" : "This booking is held"} until{" "}
              {formatSlotTime(booking.expires_at, timezone)}. Pay the deposit before then to
              confirm it.
            </p>
            {payment?.stripe_checkout_url ? (
              <Button asChild>
                <a href={payment.stripe_checkout_url}>Pay deposit</a>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/#services">Start again</Link>
              </Button>
            )}
          </>
        )}
      </article>
    </Container>
  );
}
