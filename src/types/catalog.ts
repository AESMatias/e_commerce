import type { Enums } from "@/types/database";

export type ServiceIconName = Enums<"service_icon">;
export type PackageTier = Enums<"package_tier">;

export interface ServicePackage {
  slug: string;
  tier: PackageTier;
  name: string;
  summary: string;
  priceCents: number;
  depositCents: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  isPopular: boolean;
}

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: ServiceIconName;
  idealFor: string;
  startingPriceCents: number;
  currency: string;
  packages: ServicePackage[];
}
