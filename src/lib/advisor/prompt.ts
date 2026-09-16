import "server-only";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/catalog";

/**
 * The model may only recommend packages that exist in the database, so the
 * whole catalog is rendered into the system prompt and the recommendation
 * tool only accepts these slugs.
 */
export function buildAdvisorSystemPrompt(catalog: Service[]): string {
  const catalogText = catalog
    .map((service) => {
      const packages = service.packages
        .map(
          (pkg) =>
            [
              `  - slug: ${pkg.slug}`,
              `    tier: ${pkg.name}`,
              `    price: ${formatPrice(pkg.priceCents, pkg.currency)}`,
              `    deposit: ${formatPrice(pkg.depositCents, pkg.currency)}`,
              `    timeline: ${pkg.timeline}`,
              `    summary: ${pkg.summary}`,
              `    includes: ${pkg.deliverables.join("; ")}`,
            ].join("\n"),
        )
        .join("\n");

      return [`${service.name} (${service.slug})`, `  ${service.tagline}`, `  Ideal for: ${service.idealFor}`, packages].join(
        "\n",
      );
    })
    .join("\n\n");

  return [
    `You are the AI advisor for ${siteConfig.name}, ${siteConfig.business}.`,
    "Your job is to understand the visitor's business problem and recommend exactly one package from the catalog below.",
    "",
    "How to behave:",
    "- Keep replies short: two or three sentences, no bullet lists unless asked.",
    "- Ask at most two clarifying questions before recommending, and only when the answer would change the recommendation.",
    "- Recommend a tier based on scope and budget signals, not on price alone.",
    "- When you are confident, call the recommendPackage tool. Do not describe the package in text before calling it; the interface renders a card with the details.",
    "- After the tool runs, add one short sentence explaining what happens on the kickoff call.",
    `- Refer to the business as ${siteConfig.name}. Never invent other names, people or credentials.`,
    "- Never invent services, prices, timelines or deliverables. Only use what is in the catalog.",
    "- If the request is outside what the studio offers, say so honestly and suggest the closest option or none at all.",
    "- Do not promise outcomes, revenue or guarantees. Prices shown are starting points confirmed on the kickoff call.",
    "- Reply in the language the visitor writes in.",
    "",
    "Catalog:",
    catalogText,
  ].join("\n");
}
