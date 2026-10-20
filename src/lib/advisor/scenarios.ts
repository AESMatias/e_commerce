import type { Locale } from "@/i18n/config";
import type { PackageRecommendation } from "@/types/advisor";
import type { Service } from "@/types/catalog";
import { formatPrice } from "@/lib/format";

export type CachedScenario = {
  id: string;
  matches: (text: string) => boolean;
  packageSlug: string;
  response: Record<
    Locale,
    {
      text: string;
      problemSummary: string;
      reasoning: string;
      fallback: {
        serviceName: string;
        packageName: string;
        summary: string;
        price: string;
        deposit: string;
        timeline: string;
        deliverables: string[];
      };
    }
  >;
};

export const CACHED_SCENARIOS: readonly CachedScenario[] = [
  {
    id: "bakery-online-store",
    matches: (text: string) =>
      /bakery|panader[ií]a|vender en l[ií]nea|start selling online/i.test(text),
    packageSlug: "ecommerce-store-starter",
    response: {
      en: {
        text: "For a local bakery starting to sell online, keeping things straightforward and reliable is key. The Starter E-commerce package provides a fast, mobile-friendly storefront where customers can easily browse your items, place orders, and pay with credit cards or PayPal. It includes an order notification system and a clean admin panel so you can manage products without extra complexity.",
        problemSummary: "A bakery looking to launch an online storefront to take customer orders directly.",
        reasoning: "The Starter E-commerce store provides up to 50 items, Stripe or PayPal checkout, automated order emails, and an easy admin panel to manage daily bakery orders.",
        fallback: {
          serviceName: "E-commerce Store",
          packageName: "Starter",
          summary: "Start selling online with a simple, reliable store.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 weeks",
          deliverables: [
            "Mobile-first storefront",
            "Up to 50 products",
            "Stripe or PayPal checkout",
            "Order notification emails",
            "Admin panel for products and orders",
            "14 days of post-launch support",
          ],
        },
      },
      es: {
        text: "Para una panadería que empieza a vender por internet, lo fundamental es que sea simple, rápida y confiable. El paquete Inicial de Tienda e-commerce te entrega una tienda pensada para celulares donde tus clientes pueden ver los productos, armar su pedido y pagar con tarjeta o PayPal. Incluye notificaciones automáticas por correo y un panel fácil para gestionar tus productos y pedidos sin enredos técnicos.",
        problemSummary: "Una panadería que busca lanzar su tienda online para recibir pedidos directos de sus clientes.",
        reasoning: "El paquete Inicial incluye catálogo de hasta 50 productos, checkout con Stripe o PayPal, avisos por correo y un panel de administración para gestionar pedidos.",
        fallback: {
          serviceName: "Tienda e-commerce",
          packageName: "Inicial",
          summary: "Empieza a vender en línea con una tienda simple y confiable.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 semanas",
          deliverables: [
            "Tienda pensada primero para móviles",
            "Hasta 50 productos",
            "Checkout con Stripe o PayPal",
            "Emails de notificación de pedidos",
            "Panel de administración de productos y pedidos",
            "14 días de soporte después del lanzamiento",
          ],
        },
      },
    },
  },
  {
    id: "whatsapp-high-volume",
    matches: (text: string) =>
      /whatsapp|200\s*mensajes?|200\s*messages?|no damos abasto|cannot keep up/i.test(text),
    packageSlug: "automation-bots-growth",
    response: {
      en: {
        text: "Handling 200 WhatsApp inquiries a day manually drains hours and causes missed opportunities. The Growth Automation Bot connects directly to the WhatsApp Business API to automate booking and order intake, answer frequent questions 24/7, and sync inquiries with your CRM or spreadsheet. When an issue requires personal attention, it transfers smoothly to a human teammate.",
        problemSummary: "High volume of daily WhatsApp messages needing automated replies, booking flows, and team sync.",
        reasoning: "The Growth bot handles booking and order flows directly on WhatsApp Business, synchronizes with your team's tools, and supports live handoff to human agents.",
        fallback: {
          serviceName: "Automation Bots",
          packageName: "Growth",
          summary: "Automate bookings or orders and sync them with your tools.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 weeks",
          deliverables: [
            "WhatsApp Business API, Discord API and Telegram",
            "Booking or ordering flows",
            "Integration with your CRM, spreadsheet or database",
            "Live handoff to a human agent",
            "Monthly conversation reports and advanced insights",
            "30 days of post-launch support",
          ],
        },
      },
      es: {
        text: "Responder 200 mensajes de WhatsApp al día a mano agota al equipo y hace perder ventas. El bot de Crecimiento en Automatización se integra a la API de WhatsApp Business para responder dudas frecuentes 24/7, tomar pedidos o reservas y sincronizar cada dato con tu CRM o planilla. Y cuando alguien necesita atención humana, transfiere la conversación sin perder el hilo.",
        problemSummary: "Gran volumen diario de consultas por WhatsApp que requiere respuestas automáticas, pedidos y sincronización.",
        reasoning: "El bot Crecimiento automatiza flujos de reserva y pedidos en WhatsApp Business, se conecta a tus herramientas y deriva a agentes humanos.",
        fallback: {
          serviceName: "Bots de automatización",
          packageName: "Crecimiento",
          summary: "Automatiza reservas o pedidos y sincronízalos con tus herramientas.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 semanas",
          deliverables: [
            "WhatsApp Business API, Discord API y Telegram",
            "Flujos de reserva o toma de pedidos",
            "Integración con tu CRM, planilla o base de datos",
            "Derivación en vivo a un operador humano",
            "Reportes mensuales de conversación y métricas",
            "30 días de soporte después del lanzamiento",
          ],
        },
      },
    },
  },
  {
    id: "competitor-price-scraping",
    matches: (text: string) =>
      /competitor|competencia|precios.*semana|prices.*week|recopilar.*precios|competitor prices/i.test(text),
    packageSlug: "custom-scripts-scraping-growth",
    response: {
      en: {
        text: "Collecting competitor pricing by hand every week is tedious and prone to missing flash discounts. The Growth Web Scraping package provides a scheduled cloud extractor that runs automatically every week across your target sources. It handles anti-bot protections, normalizes product codes and prices, exports cleanly to Google Sheets or your database, and alerts you if any store layout changes.",
        problemSummary: "Weekly competitor pricing collection that needs reliable, automated cloud extraction into spreadsheets.",
        reasoning: "The Growth scraping tier runs scheduled extractions in the cloud for multiple sources, exports directly to Google Sheets or a database, and includes maintenance alerts.",
        fallback: {
          serviceName: "Custom Scripts & Scraping",
          packageName: "Growth",
          summary: "Scheduled automation that runs in the cloud.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 weeks",
          deliverables: [
            "Up to 3 sources or tasks",
            "Scheduled cloud runs",
            "Export to Google Sheets or a database",
            "Error handling, logging and failure alerts",
            "30 days of maintenance",
          ],
        },
      },
      es: {
        text: "Monitorear los precios de la competencia a mano cada semana quita demasiado tiempo y es fácil que se pasen cambios importantes. El paquete de Crecimiento en Scraping y Scripts despliega un extractor programado en la nube que recopila los datos puntualmente cada semana. Gestiona bloqueos, limpia los datos, los sube directo a Google Sheets o tu base de datos y te avisa de inmediato si una web cambia su diseño.",
        problemSummary: "Extracción semanal recurrente de precios de competidores automatizada hacia planillas o bases de datos.",
        reasoning: "El paquete Crecimiento ejecuta tareas en la nube para hasta 3 fuentes con exportación a Google Sheets o bases de datos y soporte de mantenimiento.",
        fallback: {
          serviceName: "Scripts a medida y web scraping",
          packageName: "Crecimiento",
          summary: "Automatización programada que se ejecuta en la nube.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 semanas",
          deliverables: [
            "Hasta 3 fuentes o tareas",
            "Ejecuciones programadas en la nube",
            "Exportación a Google Sheets o base de datos",
            "Manejo de errores, registros y alertas",
            "30 días de mantenimiento",
          ],
        },
      },
    },
  },
  {
    id: "modern-corporate-website",
    matches: (text: string) =>
      /modern website|sitio web moderno|corporate website|sitio web corporativo|showcase our business|presentar nuestro negocio|presentar.*empresa|attract new clients|atraer nuevos clientes/i.test(text),
    packageSlug: "corporate-website-growth",
    response: {
      en: {
        text: "To present your company with authority and convert visitors into qualified leads, the Growth Corporate Website package is the perfect fit. It delivers up to 6 custom-designed, responsive pages built for high performance and search visibility (SEO), an intuitive CMS so your team can easily publish updates, and contact forms connected directly to your CRM or inbox.",
        problemSummary: "A growing company seeking a professional, high-performance website to showcase services and capture leads.",
        reasoning: "The Growth tier includes up to 6 custom pages, a self-serve CMS, complete SEO setup with sitemap and metadata, and CRM-connected forms.",
        fallback: {
          serviceName: "Corporate or Personal Website",
          packageName: "Growth",
          summary: "A multi-page site your team can manage on its own.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 weeks",
          deliverables: [
            "Up to 6 custom-designed pages",
            "CMS to edit content yourself",
            "SEO setup with sitemap and metadata",
            "Forms connected to your CRM",
            "Accessibility review",
            "14 days of post-launch support",
          ],
        },
      },
      es: {
        text: "Para presentar tu negocio con seriedad y transformar visitantes en clientes reales, el paquete de Crecimiento para Sitio Web Corporativo es la opción ideal. Te entrega hasta 6 páginas diseñadas a medida, optimizadas para máxima velocidad y posicionamiento en buscadores (SEO), un CMS intuitivo para que tu equipo actualice contenidos sin depender de programadores, y formularios enlazados directo a tu correo o CRM.",
        problemSummary: "Una empresa que necesita un sitio web profesional y moderno para exhibir sus servicios y captar nuevos clientes.",
        reasoning: "El paquete Crecimiento incluye hasta 6 páginas a medida, CMS para editar contenidos, configuración completa de SEO y formularios conectados a tu CRM.",
        fallback: {
          serviceName: "Sitio web corporativo o personal",
          packageName: "Crecimiento",
          summary: "Un sitio de varias páginas que tu equipo puede administrar solo.",
          price: "$50",
          deposit: "$5",
          timeline: "1–2 semanas",
          deliverables: [
            "Hasta 6 páginas con diseño a medida",
            "CMS para editar el contenido tú mismo",
            "SEO con sitemap y metadatos",
            "Formularios conectados a tu CRM",
            "Revisión de accesibilidad",
            "14 días de soporte después del lanzamiento",
          ],
        },
      },
    },
  },
];

export function findMatchingScenario(text: string): CachedScenario | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return CACHED_SCENARIOS.find((scenario) => scenario.matches(trimmed)) ?? null;
}

export function buildCachedRecommendation(
  scenario: CachedScenario,
  locale: Locale,
  catalog: readonly Service[],
): PackageRecommendation {
  const localized = scenario.response[locale] ?? scenario.response.en;
  const service = catalog.find((item) =>
    item.packages.some((pkg) => pkg.slug === scenario.packageSlug),
  );
  const servicePackage = service?.packages.find((pkg) => pkg.slug === scenario.packageSlug);

  return {
    recommendationId: `cached_${scenario.id}`,
    packageSlug: scenario.packageSlug,
    serviceName: service?.name ?? localized.fallback.serviceName,
    packageName: servicePackage?.name ?? localized.fallback.packageName,
    summary: servicePackage?.summary ?? localized.fallback.summary,
    price: servicePackage
      ? formatPrice(servicePackage.priceCents, servicePackage.currency, locale)
      : localized.fallback.price,
    deposit: servicePackage
      ? formatPrice(servicePackage.depositCents, servicePackage.currency, locale)
      : localized.fallback.deposit,
    timeline: servicePackage?.timeline ?? localized.fallback.timeline,
    deliverables: servicePackage?.deliverables ?? localized.fallback.deliverables,
    reasoning: localized.reasoning,
    bookingHref: `/book/${scenario.packageSlug}`,
  };
}
