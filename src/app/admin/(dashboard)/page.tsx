import type { Metadata } from "next";
import { AdvisorUsagePanel } from "@/components/admin/AdvisorUsagePanel";
import { BookingRow } from "@/components/admin/BookingRow";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Container } from "@/components/layout/Container";
import { getAdminBookings } from "@/lib/admin/bookings";
import { getAdvisorUsage } from "@/lib/rate-limit";
import { getBusinessTimezone } from "@/lib/scheduling";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookings",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [bookings, timezone, advisorUsage] = await Promise.all([
    getAdminBookings(),
    getBusinessTimezone(),
    getAdvisorUsage(),
  ]);

  const confirmed = bookings.filter((booking) => booking.status === "confirmed");
  const awaiting = bookings.filter((booking) => booking.status === "pending_payment");
  const unscheduled = confirmed.filter((booking) => !booking.startsAt);

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.subtitle}>Times shown in {timezone}</p>
        </div>
        <LogoutButton />
      </header>

      <AdvisorUsagePanel usage={advisorUsage} timezone={timezone} now={new Date()} />

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Confirmed</dt>
          <dd className={styles.statValue}>{confirmed.length}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Awaiting payment</dt>
          <dd className={styles.statValue}>{awaiting.length}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>To arrange</dt>
          <dd className={styles.statValue}>{unscheduled.length}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Total</dt>
          <dd className={styles.statValue}>{bookings.length}</dd>
        </div>
      </dl>

      {bookings.length === 0 ? (
        <p className={styles.empty}>No bookings yet.</p>
      ) : (
        <ul role="list" className={styles.list}>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingRow booking={booking} timezone={timezone} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
