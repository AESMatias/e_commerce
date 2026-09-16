// Global styles first: they are layered, so CSS Modules always take precedence.
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollState } from "@/components/layout/ScrollState";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ScrollState />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
