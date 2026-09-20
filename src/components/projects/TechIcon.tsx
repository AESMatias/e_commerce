import type { TechName } from "@/types/projects";

/** The name shown under the mark while the pointer is on it. */
export const techLabels: Record<TechName, string> = {
  next: "Next.js",
  react: "React",
  stripe: "Stripe",
  python: "Python",
  postgres: "PostgreSQL",
  whatsapp: "WhatsApp",
  openai: "AI model",
  shopify: "Storefront",
  chart: "Dashboard",
};

/**
 * The technology marks shown on a project card, simplified onto the same
 * 24x24 grid as the service icons so they sit together as one set.
 */
const glyphs: Record<TechName, React.ReactNode> = {
  next: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9 16V8.6l7 8" />
      <path d="M15.2 8v4.4" />
    </>
  ),
  react: (
    <>
      <circle cx="12" cy="12" r="2" />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.7" />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.7" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.7" transform="rotate(120 12 12)" />
    </>
  ),
  stripe: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </>
  ),
  python: (
    <>
      <path d="M12 3c-3 0-4.4 1-4.4 2.8V9h4.6" />
      <path d="M7.6 9H5.4C3.9 9 3 10.4 3 12.6S3.9 16 5.4 16h2.2v-3.2c0-1.7 1.3-2.8 3-2.8h3.8" />
      <path d="M12 21c3 0 4.4-1 4.4-2.8V15h-4.6" />
      <path d="M16.4 15h2.2c1.5 0 2.4-1.4 2.4-3.6S20.1 8 18.6 8h-2.2" />
    </>
  ),
  postgres: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12" />
      <path d="M9.2 9.4c.3 2.4 2.3 4.4 4.7 4.8l1-1.2 1.6.8c-.3 1.2-1.5 1.8-2.8 1.5-2.6-.6-4.7-2.7-5.3-5.3-.3-1.3.3-2.5 1.5-2.8l.8 1.6z" />
    </>
  ),
  openai: (
    <>
      <path d="M12 3.2 13.9 8l4.9 1.9-4.9 1.9L12 16.6l-1.9-4.8L5.2 9.9 10.1 8z" />
      <path d="M18 16.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  shopify: (
    <>
      <path d="M4 8h16l-1 11.5a1.5 1.5 0 0 1-1.5 1.4h-11A1.5 1.5 0 0 1 5 19.5z" />
      <path d="M8.5 8V6.2a3.5 3.5 0 0 1 7 0V8" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7.5 15.5v-3M12 15.5v-6M16.5 15.5v-4.5" />
    </>
  ),
};

export function TechIcon({ name, size = 18 }: { name: TechName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[name]}
    </svg>
  );
}
