import "server-only";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { formatPrice, formatSlotRange } from "@/lib/format";
import { getBusinessTimezone } from "@/lib/scheduling";
import { createAdminClient } from "@/lib/supabase/admin";

/** Google Calendar "add event" link, so both sides can save the call in one click. */
function calendarLink(title: string, startsAt: string, endsAt: string, details: string): string {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(new Date(startsAt).toISOString())}/${stamp(new Date(endsAt).toISOString())}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function layout(body: string): string {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#12151c">${body}</div>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:4px 16px 4px 0;color:#6b7385">${label}</td><td style="padding:4px 0"><strong>${value}</strong></td></tr>`;
}

/**
 * Emails the studio owner once a booking is confirmed, with everything needed
 * to contact the client. Clients are deliberately not emailed: the booking page
 * tells them there and then whether the time was taken.
 *
 * Never throws — a failed email must not undo a confirmed booking.
 */
export async function sendBookingConfirmedEmails(bookingId: string): Promise<void> {
  if (!isEmailConfigured()) return;

  try {
    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, starts_at, ends_at, deposit_cents, currency, project_notes, customer_id, package_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) return;

    const [{ data: customer }, { data: servicePackage }] = await Promise.all([
      supabase.from("customers").select("email, full_name, company").eq("id", booking.customer_id).maybeSingle(),
      supabase.from("service_packages").select("name, service_id").eq("id", booking.package_id).maybeSingle(),
    ]);

    const { data: service } = servicePackage
      ? await supabase.from("services").select("name").eq("id", servicePackage.service_id).maybeSingle()
      : { data: null };

    if (!customer) return;

    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) return;

    const timezone = await getBusinessTimezone();
    const packageLabel = `${service?.name ?? "Project"} ${servicePackage?.name ?? ""}`.trim();
    const deposit = formatPrice(booking.deposit_cents, booking.currency);
    const isScheduled = Boolean(booking.starts_at && booking.ends_at);
    const when = isScheduled
      ? formatSlotRange(booking.starts_at ?? "", booking.ends_at ?? "", timezone)
      : "No time chosen — the client wants to arrange it with you";

    const calendarRow =
      isScheduled && booking.starts_at && booking.ends_at
        ? `<p style="margin:0 0 16px"><a href="${calendarLink(
            `Kickoff call — ${packageLabel}`,
            booking.starts_at,
            booking.ends_at,
            `Kickoff call with ${customer.full_name} (${customer.email}).`,
          )}">Add it to your calendar</a> · Reply to this email to reach the client.</p>`
        : `<p style="margin:0 0 16px">Reply to this email to reach the client and agree on a time.</p>`;

    await sendEmail({
      to: ownerEmail,
      replyTo: customer.email,
      subject: isScheduled
        ? `New kickoff call — ${customer.full_name} (${packageLabel})`
        : `New booking, no time yet — ${customer.full_name} (${packageLabel})`,
      html: layout(`
        <h2 style="margin:0 0 12px">${isScheduled ? "New kickoff call booked" : "New booking without a time"}</h2>
        <table style="border-collapse:collapse;margin-bottom:16px">
          ${row("When", when)}
          ${row("Package", packageLabel)}
          ${row("Name", customer.full_name)}
          ${row("Email", customer.email)}
          ${row("Company", customer.company ?? "—")}
          ${row("Deposit", deposit)}
        </table>
        <p style="margin:0 0 8px;color:#6b7385">What they want to build</p>
        <p style="margin:0 0 16px;white-space:pre-wrap">${booking.project_notes ?? "(nothing written)"}</p>
        ${calendarRow}
      `),
    });
  } catch (error) {
    console.error("Failed to send the booking emails", error);
  }
}
