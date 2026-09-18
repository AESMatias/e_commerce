// Global styles first: they are layered, so CSS Modules always take precedence.
import "@/styles/globals.css";

import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollState } from "@/components/layout/ScrollState";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary } from "@/i18n/server";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();

  return {
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: t.meta.description,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, t } = await getDictionary();

  return (
    <html
      lang={locale}
      className={instrumentSans.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <I18nProvider locale={locale} t={t}>
          <ScrollState />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
