import { cancelBookingAction } from "@/lib/admin/actions";
import type { AdminBooking } from "@/lib/admin/bookings";
import { cx } from "@/lib/cx";
import { formatPrice, formatSlotRange } from "@/lib/format";
import styles from "./BookingRow.module.css";

const STATUS_LABELS: Record<AdminBooking["status"], string> = {
  confirmed: "Confirmed",
  pending_payment: "Awaiting payment",
  cancelled: "Cancelled",
  expired: "Expired",
};

/** CSS Module class names stay camelCase, database statuses are snake_case. */
const STATUS_CLASSES: Record<AdminBooking["status"], string | undefined> = {
  confirmed: styles.confirmed,
  pending_payment: styles.awaitingPayment,
  cancelled: styles.inactive,
  expired: styles.inactive,
};

export function BookingRow({ booking, timezone }: { booking: AdminBooking; timezone: string }) {
  const when =
    booking.startsAt && booking.endsAt
      ? formatSlotRange(booking.startsAt, booking.endsAt, timezone)
      : "To arrange — the client will get in touch";
  const canCancel = booking.status === "confirmed" || booking.status === "pending_payment";

  return (
    <article className={styles.row}>
      <header className={styles.head}>
        <span className={cx(styles.status, STATUS_CLASSES[booking.status])}>
          {STATUS_LABELS[booking.status]}
        </span>
        <span className={styles.when}>{when}</span>
      </header>

      <div className={styles.body}>
        <div className={styles.block}>
          <p className={styles.name}>{booking.customerName}</p>
          <p className={styles.detail}>
            <a href={`mailto:${booking.customerEmail}`} className={styles.link}>
              {booking.customerEmail}
            </a>
          </p>
          {booking.customerCompany && <p className={styles.detail}>{booking.customerCompany}</p>}
        </div>

        <div className={styles.block}>
          <p className={styles.detail}>
            {booking.serviceName} {booking.packageName}
          </p>
          <p className={styles.detail}>
            Deposit {formatPrice(booking.depositCents, booking.currency)}
            {booking.paymentStatus ? ` · payment ${booking.paymentStatus}` : " · no payment yet"}
          </p>
        </div>
      </div>

      {booking.projectNotes && <p className={styles.notes}>{booking.projectNotes}</p>}

      {canCancel && (
        <form action={cancelBookingAction} className={styles.actions}>
          <input type="hidden" name="bookingId" value={booking.id} />
          <button type="submit" className={styles.cancel}>
            Cancel booking
          </button>
        </form>
      )}
    </article>
  );
}
