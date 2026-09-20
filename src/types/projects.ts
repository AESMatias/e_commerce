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
  | "chart";

export interface Project {
  name: string;
  summary: string;
  /** Photo behind the card; a placeholder until real screenshots exist. */
  image: string;
  tech: readonly TechName[];
}
