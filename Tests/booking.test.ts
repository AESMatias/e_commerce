import { describe, it, expect } from "vitest";
import { z } from "zod";
import { dictionaries } from "@/i18n/dictionaries";
import { formatDurationMinutes, formatPrice, formatSlotRange, formatTimeline } from "@/lib/format";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function buildBookingSchema(errors = dictionaries.en.bookingErrors) {
  return z
    .object({
      packageSlug: z.string().min(1),
      mode: z.enum(["scheduled", "unscheduled"]),
      startsAt: z.string(),
      fullName: z.string().min(2, errors.nameRequired).max(120, errors.nameTooLong),
      email: z.string().regex(EMAIL_PATTERN, errors.emailInvalid).max(160),
      company: z.string().max(120, errors.companyTooLong),
      projectNotes: z.string().max(2000, errors.notesTooLong),
    })
    .refine((value) => value.mode === "unscheduled" || !Number.isNaN(Date.parse(value.startsAt)), {
      path: ["startsAt"],
      message: errors.pickTime,
    });
}

describe("Booking validation schema (pedir hora)", () => {
  const schema = buildBookingSchema();

  it("accepts a valid scheduled appointment", () => {
    const validData = {
      packageSlug: "corporate-website-starter",
      mode: "scheduled" as const,
      startsAt: "2026-11-01T14:00:00Z",
      fullName: "Matias Silva",
      email: "matias@example.com",
      company: "Acme Corp",
      projectNotes: "Need a landing page by end of month.",
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts an unscheduled booking without a time slot", () => {
    const unscheduledData = {
      packageSlug: "ecommerce-store-growth",
      mode: "unscheduled" as const,
      startsAt: "",
      fullName: "Ana Gomez",
      email: "ana@example.com",
      company: "",
      projectNotes: "",
    };

    const result = schema.safeParse(unscheduledData);
    expect(result.success).toBe(true);
  });

  it("rejects a scheduled appointment missing startsAt date", () => {
    const missingDate = {
      packageSlug: "automation-bots-growth",
      mode: "scheduled" as const,
      startsAt: "",
      fullName: "Carlos Perez",
      email: "carlos@example.com",
      company: "",
      projectNotes: "",
    };

    const result = schema.safeParse(missingDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("startsAt");
    }
  });

  it("rejects an invalid email format", () => {
    const invalidEmail = {
      packageSlug: "corporate-website-growth",
      mode: "unscheduled" as const,
      startsAt: "",
      fullName: "Carlos Perez",
      email: "not-an-email",
      company: "",
      projectNotes: "",
    };

    const result = schema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("email");
    }
  });

  it("rejects names that are too short", () => {
    const shortName = {
      packageSlug: "corporate-website-growth",
      mode: "unscheduled" as const,
      startsAt: "",
      fullName: "A",
      email: "test@example.com",
      company: "",
      projectNotes: "",
    };

    const result = schema.safeParse(shortName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("fullName");
    }
  });
});

describe("Scheduling and price formatters", () => {
  it("formats prices correctly from cents in USD", () => {
    expect(formatPrice(50000, "usd", "en")).toBe("$500");
    expect(formatPrice(250000, "usd", "en")).toBe("$2,500");
  });

  it("calculates slot duration correctly", () => {
    const start = "2026-10-25T10:00:00Z";
    const end = "2026-10-25T10:30:00Z";
    expect(formatDurationMinutes(start, end)).toBe("30 min");
  });

  it("formats timeline ranges for packages across languages", () => {
    expect(formatTimeline(1, 1, "en")).toBe("1 week");
    expect(formatTimeline(2, 4, "en")).toBe("2–4 weeks");
    expect(formatTimeline(1, 1, "es")).toBe("1 semana");
    expect(formatTimeline(2, 4, "es")).toBe("2–4 semanas");
  });

  it("formats slot ranges with date and time", () => {
    const start = "2026-10-25T14:00:00Z";
    const end = "2026-10-25T14:30:00Z";
    const formatted = formatSlotRange(start, end, "UTC", "en");
    expect(formatted).toContain("October");
    expect(formatted).toContain("2:00 PM – 2:30 PM");
  });
});
