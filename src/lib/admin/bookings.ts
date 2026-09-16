import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/types/database";

export type AdminBooking = {
  id: string;
  status: Enums<"booking_status">;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  expiresAt: string;
  depositCents: number;
  currency: string;
  projectNotes: string | null;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  packageName: string;
  serviceName: string;
  paymentStatus: Enums<"payment_status"> | null;
};

const MAX_ROWS = 200;

/**
 * Every booking with the details needed to contact the client, newest first.
 * Related rows are fetched in bulk and joined in memory to keep the query
 * types simple.
 */
export async function getAdminBookings(): Promise<AdminBooking[]> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, status, starts_at, ends_at, created_at, expires_at, deposit_cents, currency, project_notes, customer_id, package_id",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) throw new Error(`Failed to load bookings: ${error.message}`);
  if (bookings.length === 0) return [];

  const customerIds = [...new Set(bookings.map((booking) => booking.customer_id))];
  const packageIds = [...new Set(bookings.map((booking) => booking.package_id))];
  const bookingIds = bookings.map((booking) => booking.id);

  const [{ data: customers }, { data: packages }, { data: payments }] = await Promise.all([
    supabase.from("customers").select("id, full_name, email, company").in("id", customerIds),
    supabase.from("service_packages").select("id, name, service_id").in("id", packageIds),
    supabase.from("payments").select("booking_id, status, created_at").in("booking_id", bookingIds),
  ]);

  const serviceIds = [...new Set((packages ?? []).map((servicePackage) => servicePackage.service_id))];
  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, name").in("id", serviceIds)
    : { data: [] };

  const customerById = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const packageById = new Map((packages ?? []).map((item) => [item.id, item]));
  const serviceById = new Map((services ?? []).map((service) => [service.id, service]));

  // Keep the most recent payment per booking.
  const paymentByBooking = new Map<string, { status: Enums<"payment_status">; created_at: string }>();
  for (const payment of payments ?? []) {
    const current = paymentByBooking.get(payment.booking_id);
    if (!current || current.created_at < payment.created_at) {
      paymentByBooking.set(payment.booking_id, { status: payment.status, created_at: payment.created_at });
    }
  }

  return bookings.map((booking): AdminBooking => {
    const customer = customerById.get(booking.customer_id);
    const servicePackage = packageById.get(booking.package_id);
    const service = servicePackage ? serviceById.get(servicePackage.service_id) : undefined;

    return {
      id: booking.id,
      status: booking.status,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      createdAt: booking.created_at,
      expiresAt: booking.expires_at,
      depositCents: booking.deposit_cents,
      currency: booking.currency,
      projectNotes: booking.project_notes,
      customerName: customer?.full_name ?? "Unknown",
      customerEmail: customer?.email ?? "",
      customerCompany: customer?.company ?? null,
      packageName: servicePackage?.name ?? "",
      serviceName: service?.name ?? "",
      paymentStatus: paymentByBooking.get(booking.id)?.status ?? null,
    };
  });
}
