export const siteConfig = {
  name: "Wholeheartedly",
  author: "AESMatias",
  /** Public contact for customers, privacy requests and refunds. */
  contactEmail: "plutarco1677@gmail.com",
  /**
   * Who legally provides the service, as shown in the privacy policy and the
   * terms, in each language. Replace it with the company's legal name once it
   * is incorporated.
   */
  legalOperator: {
    en: "AESMatias, an independent developer based in Chile",
    es: "AESMatias, desarrollador independiente con base en Chile",
  },
  /**
   * Date shown on the privacy policy and the terms, as YYYY-MM-DD (each page
   * formats it in the visitor's language). Update it with any change.
   */
  legalUpdated: "2026-09-16",
  /** How the AI advisor introduces the business. Edit this to change its pitch. */
  business: "a software studio that sells fixed-scope development packages",
  // The site description lives in src/i18n/dictionaries (meta.description).
} as const;
