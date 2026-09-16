import "server-only";
import { formatTimeline } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";
import type { Service, ServicePackage } from "@/types/catalog";

export type CatalogPackage = { service: Service; servicePackage: ServicePackage };

const CATALOG_QUERY =
  "slug, name, tagline, description, icon, ideal_for, service_packages (slug, tier, name, summary, price_cents, deposit_cents, currency, timeline_weeks_min, timeline_weeks_max, deliverables, is_popular, sort_order)";

/** Active services with their active packages, ordered for display. */
export async function getCatalog(): Promise<Service[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select(CATALOG_QUERY)
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    throw new Error(`Failed to load the service catalog: ${error.message}`);
  }

  return data.flatMap((service): Service[] => {
    const packages = service.service_packages
      .toSorted((a, b) => a.sort_order - b.sort_order)
      .map(
        (pkg): ServicePackage => ({
          slug: pkg.slug,
          tier: pkg.tier,
          name: pkg.name,
          summary: pkg.summary,
          priceCents: pkg.price_cents,
          depositCents: pkg.deposit_cents,
          currency: pkg.currency,
          timeline: formatTimeline(pkg.timeline_weeks_min, pkg.timeline_weeks_max),
          deliverables: pkg.deliverables,
          isPopular: pkg.is_popular,
        }),
      );

    const [cheapest] = packages.toSorted((a, b) => a.priceCents - b.priceCents);
    if (!cheapest) return [];

    return [
      {
        slug: service.slug,
        name: service.name,
        tagline: service.tagline,
        description: service.description,
        icon: service.icon,
        idealFor: service.ideal_for,
        startingPriceCents: cheapest.priceCents,
        currency: cheapest.currency,
        packages,
      },
    ];
  });
}

/** Looks up a single package (and its parent service) by package slug. */
export async function getPackageBySlug(slug: string): Promise<CatalogPackage | null> {
  const catalog = await getCatalog();

  for (const service of catalog) {
    const servicePackage = service.packages.find((pkg) => pkg.slug === slug);
    if (servicePackage) return { service, servicePackage };
  }

  return null;
}
