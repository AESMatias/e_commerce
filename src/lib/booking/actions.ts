"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/server";
import { getPackageBySlug } from "@/lib/catalog";
import { createDepositCheckout } from "@/lib/stripe/checkout";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

type FieldName = "fullName" | "email" | "company" | "projectNotes" | "startsAt";

export type BookingFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<FieldName, string>>;
};

// Same shape the database enforces on customers.email.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Built per request so the validation messages match the visitor's language. */
function bookingSchema(errors: Dictionary["bookingErrors"]) {
  return (
    z
      .object({
        packageSlug: z.string().min(1),
        mode: z.enum(["scheduled", "unscheduled"]),
        startsAt: z.string(),
        fullName: z.string().min(2, errors.nameRequired).max(120, errors.nameTooLong),
        email: z.string().regex(EMAIL_PATTERN, errors.emailInvalid).max(160),
        company: z.string().max(120, errors.companyTooLong),
        projectNotes: z.string().max(2000, errors.notesTooLong),
      })
      // A scheduled booking needs a valid time; an unscheduled one must not have one.
      .refine((value) => value.mode === "unscheduled" || !Number.isNaN(Date.parse(value.startsAt)), {
        path: ["startsAt"],
        message: errors.pickTime,
      })
  );
}

const FIELD_NAMES: FieldName[] = ["fullName", "email", "company", "projectNotes", "startsAt"];

function readTrimmed(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requestOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function createBookingAction(
  _previousState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const { locale, t } = await getDictionary();
  const errors = t.bookingErrors;

  const parsed = bookingSchema(errors).safeParse({
    packageSlug: readTrimmed(formData, "packageSlug"),
    mode: readTrimmed(formData, "mode") || "scheduled",
    startsAt: readTrimmed(formData, "startsAt"),
    fullName: readTrimmed(formData, "fullName"),
    email: readTrimmed(formData, "email").toLowerCase(),
    company: readTrimmed(formData, "company"),
    projectNotes: readTrimmed(formData, "projectNotes"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<FieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && FIELD_NAMES.includes(field as FieldName)) {
        fieldErrors[field as FieldName] ??= issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const input = parsed.data;

  if (!isStripeConfigured()) {
    return { status: "error", message: errors.paymentsUnavailable };
  }

  const found = await getPackageBySlug(input.packageSlug, locale);
  if (!found) {
    return { status: "error", message: errors.packageUnavailable };
  }

  const supabase = createAdminClient();

  // 1. Hold the slot (or create a booking with no time). The database rejects
  //    a slot that is already taken.
  const { data: booking, error } = await supabase.rpc("create_booking_hold", {
    p_package_slug: input.packageSlug,
    // null means "no time chosen; the client will arrange it".
    p_starts_at: input.mode === "scheduled" ? new Date(input.startsAt).toISOString() : null,
    p_email: input.email,
    p_full_name: input.fullName,
    p_company: input.company || undefined,
    p_project_notes: input.projectNotes || undefined,
  });

  if (error) {
    if (error.code === "DS409") {
      return { status: "error", message: errors.timeTaken };
    }
    if (error.code === "DS404") {
      return { status: "error", message: errors.packageUnavailable };
    }
    return { status: "error", message: errors.reserveFailed };
  }

  // 2. Create the Stripe Checkout session for the deposit.
  const packageName = `${found.service.name} ${found.servicePackage.name}`;
  let checkoutUrl: string;
  try {
    checkoutUrl = await createDepositCheckout({
      booking,
      customerEmail: input.email,
      productName: interpolate(t.checkout.productName, { name: packageName }),
      productDescription: interpolate(t.checkout.productDescription, { name: packageName }),
      locale,
      origin: await requestOrigin(),
    });
  } catch (checkoutError) {
    console.error("Failed to start checkout", checkoutError);
    // Release the slot straight away instead of waiting for the hold to lapse.
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
    return { status: "error", message: errors.checkoutFailed };
  }

  // 3. Hand the visitor over to Stripe's hosted checkout page.
  redirect(checkoutUrl);
}
