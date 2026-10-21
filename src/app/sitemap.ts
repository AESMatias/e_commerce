import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const PACKAGES = [
  "corporate-website-starter",
  "corporate-website-growth",
  "corporate-website-scale",
  "ecommerce-store-starter",
  "ecommerce-store-growth",
  "ecommerce-store-scale",
  "automation-bots-starter",
  "automation-bots-growth",
  "automation-bots-scale",
  "custom-scripts-scraping-starter",
  "custom-scripts-scraping-growth",
  "custom-scripts-scraping-scale",
  "data-science-analytics-starter",
  "data-science-analytics-growth",
  "data-science-analytics-scale",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/$/, "");
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          es: `${baseUrl}?lang=es`,
          en: `${baseUrl}?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(siteConfig.legalUpdated),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          es: `${baseUrl}/privacy?lang=es`,
          en: `${baseUrl}/privacy?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(siteConfig.legalUpdated),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          es: `${baseUrl}/terms?lang=es`,
          en: `${baseUrl}/terms?lang=en`,
        },
      },
    },
    ...PACKAGES.map((slug) => ({
      url: `${baseUrl}/book/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
