/** The technology marks a project card can show. */
export type TechName =
  | "next"
  | "react"
  | "stripe"
  | "python"
  | "postgres"
  | "whatsapp"
  | "openai"
  | "shopify"
  | "chart"
  | "astro"
  | "rust";

export interface Project {
  name: string;
  summary: string;
  /** Photo behind the card and in its details; a screenshot for real projects. */
  image: string;
  /** A diagram is shown whole in the details (a screenshot fills a browser frame). */
  imageKind?: "screenshot" | "diagram";
  tech: readonly TechName[];
  /** The longer story shown when the card is opened; the summary is used without it. */
  description?: string;
  highlights?: readonly string[];
  /** The live site and the source code, shown as buttons in the details. */
  url?: string;
  repo?: string;
}
