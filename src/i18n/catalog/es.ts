import type { CatalogTranslation } from "./index";

/**
 * Spanish text for the catalog stored in Supabase, keyed by slug. Prices,
 * timelines and everything else still come from the database.
 *
 * When you edit a service or package in the database (supabase/seed.sql),
 * update its entry here too. Anything missing falls back to the English text
 * from the database, so a forgotten entry never breaks the page.
 */
export const catalogEs: CatalogTranslation = {
  services: {
    "corporate-website": {
      name: "Sitio web corporativo o personal",
      tagline: "Un sitio rápido y optimizado para SEO que convierte visitas en clientes.",
      description:
        "Un sitio web diseñado a medida para tu empresa o para ti, pensado para la velocidad, la visibilidad en buscadores y las conversiones.",
      idealFor: "Empresas de servicios, agencias y startups que necesitan una presencia en línea creíble.",
    },
    "ecommerce-store": {
      name: "Tienda e-commerce",
      tagline: "Una tienda en línea completa con pagos seguros incluidos.",
      description:
        "Una tienda en línea de punta a punta con gestión de productos, checkout y pasarelas de pago, para que vendas desde el primer día.",
      idealFor: "Marcas y comercios listos para vender en línea o dejar de pagar comisiones de marketplaces.",
    },
    "automation-bots": {
      name: "Bots de automatización",
      tagline: "Bots de WhatsApp y Telegram que trabajan día y noche.",
      description:
        "Bots conversacionales que responden a clientes, toman pedidos o agendan citas de forma automática, conectados a las herramientas que ya usas.",
      idealFor: "Equipos que reciben un gran volumen de mensajes repetitivos de clientes.",
    },
    "custom-scripts-scraping": {
      name: "Scripts a medida y web scraping",
      tagline: "Automatiza el trabajo repetitivo y recopila los datos que necesitas.",
      description:
        "Scripts hechos a medida que eliminan tareas manuales o recopilan datos públicos de la web de forma programada, entregados en el formato con el que trabaja tu equipo.",
      idealFor: "Equipos de operaciones e investigación que pierden horas copiando y pegando.",
    },
    "data-science-analytics": {
      name: "Ciencia de datos y analítica",
      tagline: "Convierte datos en decisiones con dashboards y modelos.",
      description:
        "De planillas desordenadas a conclusiones claras: limpiamos y analizamos tus datos, creamos dashboards y sumamos modelos predictivos donde aportan valor.",
      idealFor: "Negocios que recopilan datos pero no logran sacarles provecho.",
    },
  },
  packages: {
    "corporate-website-starter": {
      name: "Inicial",
      summary: "Un sitio de una página, pulido, para lanzar rápido.",
      deliverables: [
        "Sitio web responsive de una página (hasta 5 secciones)",
        "Formulario de contacto que llega a tu correo",
        "SEO básico en la página",
        "Configuración de analítica",
        "3 días de soporte después del lanzamiento",
      ],
    },
    "corporate-website-growth": {
      name: "Crecimiento",
      summary: "Un sitio de varias páginas que tu equipo puede administrar solo.",
      deliverables: [
        "Todo lo del plan Inicial, más:",
        "Hasta 6 páginas con diseño a medida",
        "CMS para editar el contenido tú mismo",
        "SEO con sitemap y metadatos",
        "Formularios conectados a tu CRM",
        "Revisión de accesibilidad",
        "14 días de soporte después del lanzamiento",
      ],
    },
    "corporate-website-scale": {
      name: "Escala",
      summary: "Un sitio multilingüe y con mucho contenido, hecho para crecer.",
      deliverables: [
        "Todo lo del plan Crecimiento, más:",
        "Hasta 15 páginas con diseño a medida",
        "Soporte multilingüe (2 idiomas)",
        "Blog con categorías y búsqueda",
        "Integraciones con terceros (reservas, chat en vivo, etc.)",
        "Optimización de rendimiento (Core Web Vitals)",
        "30 días de soporte después del lanzamiento",
      ],
    },
    "ecommerce-store-starter": {
      name: "Inicial",
      summary: "Empieza a vender en línea con una tienda simple y confiable.",
      deliverables: [
        "Tienda pensada primero para móviles",
        "Hasta 50 productos",
        "Checkout con Stripe o PayPal",
        "Emails de notificación de pedidos",
        "Panel de administración de productos y pedidos",
        "14 días de soporte después del lanzamiento",
      ],
    },
    "ecommerce-store-growth": {
      name: "Crecimiento",
      summary: "Una tienda completa para un catálogo en crecimiento.",
      deliverables: [
        "Todo lo del plan Inicial, más:",
        "Hasta 500 productos con variantes e inventario",
        "Cuentas de cliente e historial de pedidos",
        "Pagos con Stripe y PayPal",
        "Códigos de descuento",
        "Reglas de envío e impuestos",
        "30 días de soporte después del lanzamiento",
      ],
    },
    "ecommerce-store-scale": {
      name: "Escala",
      summary: "Comercio avanzado con integraciones y automatización.",
      deliverables: [
        "Todo lo del plan Crecimiento, más:",
        "Productos ilimitados",
        "Precios en varias monedas",
        "Integración con ERP o sistema de inventario",
        "Recuperación de carritos abandonados",
        "Dashboard de analítica de ventas",
        "90 días de soporte después del lanzamiento",
      ],
    },
    "automation-bots-starter": {
      name: "Inicial",
      summary: "Responde preguntas frecuentes automáticamente en un canal.",
      deliverables: [
        "Bot de WhatsApp, Telegram o Discord",
        "Flujos de preguntas frecuentes para hasta 20 temas",
        "Protección antispam y límite de mensajes",
        "Dashboard básico de analítica si lo necesitas",
        "Plantillas de mensajes y respuestas automáticas",
        "Personalidad del bot personalizable",
        "Aviso cuando se necesita a una persona",
        "Despliegue y guía de configuración",
        "7 días de soporte después del lanzamiento",
      ],
    },
    "automation-bots-growth": {
      name: "Crecimiento",
      summary: "Automatiza reservas o pedidos y sincronízalos con tus herramientas.",
      deliverables: [
        "Todo lo del plan Inicial, más:",
        "API de WhatsApp Business, API de Discord y Telegram",
        "Flujos de reservas o pedidos",
        "Integración con tu CRM, planilla o base de datos",
        "Traspaso en vivo a un agente humano",
        "Informes mensuales de conversaciones y métricas avanzadas",
        "30 días de soporte después del lanzamiento",
      ],
    },
    "automation-bots-scale": {
      name: "Escala",
      summary: "Un asistente con IA entrenado con el conocimiento de tu negocio.",
      deliverables: [
        "Todo lo del plan Crecimiento, más:",
        "Respuestas con IA basadas en tu base de conocimiento",
        "Integración con varios sistemas",
        "Campañas de difusión con consentimiento",
        "Dashboard de administración",
        "Gestión de usuarios y permisos",
        "Personalidad y comportamiento del bot totalmente personalizables",
        "Monitoreo de disponibilidad y 60 días de soporte",
      ],
    },
    "custom-scripts-scraping-starter": {
      name: "Inicial",
      summary: "Un script que automatiza una sola tarea o fuente de datos.",
      deliverables: [
        "Revisión de factibilidad y términos de uso",
        "Un script para una tarea o sitio web",
        "Exportación a CSV, Excel u otro formato",
        "Instrucciones para ejecutarlo tú mismo",
        "3 días de soporte después de la entrega",
      ],
    },
    "custom-scripts-scraping-growth": {
      name: "Crecimiento",
      summary: "Automatización programada que se ejecuta en la nube.",
      deliverables: [
        "Todo lo del plan Inicial, más:",
        "Hasta 3 fuentes o tareas",
        "Ejecuciones programadas en la nube",
        "Exportación a Google Sheets o a una base de datos",
        "Manejo de errores, registros y alertas de fallos",
        "30 días de mantenimiento",
      ],
    },
    "custom-scripts-scraping-scale": {
      name: "Escala",
      summary: "Un pipeline de datos con mantenimiento y su propia API.",
      deliverables: [
        "Todo lo del plan Crecimiento, más:",
        "Hasta 10 fuentes o tareas",
        "Estrategia de límites de solicitudes y reintentos",
        "Endpoint de API para acceder a tus datos",
        "Dashboard con el historial de ejecuciones",
        "60 días de mantenimiento",
      ],
    },
    "data-science-analytics-starter": {
      name: "Inicial",
      summary: "Entiende lo que te dicen tus datos.",
      deliverables: [
        "Auditoría y limpieza de datos (hasta 3 conjuntos)",
        "Informe de análisis exploratorio",
        "Presentación de conclusiones clave",
        "Dashboard en Google Sheets o Excel con gráficos y tablas",
        "7 días de soporte",
      ],
    },
    "data-science-analytics-growth": {
      name: "Crecimiento",
      summary: "Sigue tus métricas clave en un dashboard en vivo.",
      deliverables: [
        "Todo lo del plan Inicial, más:",
        "Dashboard interactivo (Looker Studio, Power BI o Metabase)",
        "Taller para definir KPIs",
        "Actualización automática de datos",
        "Integración de fuentes de datos (hasta 3)",
        "30 días de soporte",
      ],
    },
    "data-science-analytics-scale": {
      name: "Escala",
      summary: "Anticipa lo que viene con modelos a medida.",
      deliverables: [
        "Todo lo del plan Crecimiento, más:",
        "Modelo predictivo (pronóstico, abandono o segmentación)",
        "Otro modelo o dashboard a medida (hasta 2)",
        "Pipeline de datos automatizado",
        "Documentación del modelo y traspaso",
        "60 días de soporte",
      ],
    },
  },
};
