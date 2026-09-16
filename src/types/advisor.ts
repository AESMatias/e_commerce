/** Structured recommendation produced by the AI advisor and rendered in the chat. */
export interface PackageRecommendation {
  recommendationId: string | null;
  packageSlug: string;
  serviceName: string;
  packageName: string;
  summary: string;
  price: string;
  deposit: string;
  timeline: string;
  deliverables: string[];
  reasoning: string;
  bookingHref: string;
}

export function isPackageRecommendation(value: unknown): value is PackageRecommendation {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.packageSlug === "string" &&
    typeof candidate.packageName === "string" &&
    typeof candidate.serviceName === "string" &&
    typeof candidate.bookingHref === "string" &&
    Array.isArray(candidate.deliverables)
  );
}
