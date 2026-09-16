-- Wholeheartedly db: this is idempotent seed data (safe to run more than once)
-- Prices are in USD cents.

-- Services:
insert into public.services (slug, name, tagline, description, icon, ideal_for, sort_order)
values
  (
    'corporate-website',
    'Corporate or Personal Website',
    'A fast, SEO-ready website that turns visitors into leads.',
    'A custom-designed website for your company or yourself, built for speed, search visibility and conversions.',
    'globe',
    'Service businesses, agencies and startups that need a credible online presence.',
    1
  ),
  (
    'ecommerce-store',
    'E-commerce Store',
    'A complete online store with secure payments built in.',
    'An end-to-end online store with product management, checkout and payment gateways, so you can start selling from day one.',
    'cart',
    'Brands and retailers ready to sell online or move away from marketplace fees.',
    2
  ),
  (
    'automation-bots',
    'Automation Bots',
    'WhatsApp and Telegram bots that work around the clock.',
    'Conversational bots that answer customers, take orders or book appointments automatically, connected to the tools you already use.',
    'bot',
    'Teams handling a high volume of repetitive customer messages.',
    3
  ),
  (
    'custom-scripts-scraping',
    'Custom Scripts & Web Scraping',
    'Automate repetitive work and collect the data you need.',
    'Tailor-made scripts that remove manual tasks or gather public web data on a schedule, delivered in the format your team works with.',
    'code',
    'Operations and research teams losing hours to copy-paste work.',
    4
  ),
  (
    'data-science-analytics',
    'Data Science & Analytics',
    'Turn raw data into decisions with dashboards and models.',
    'From messy spreadsheets to clear insights: we clean and analyze your data, build dashboards and add predictive models where they create value.',
    'chart',
    'Businesses that collect data but struggle to act on it.',
    5
  )
on conflict (slug) do update set
  name        = excluded.name,
  tagline     = excluded.tagline,
  description = excluded.description,
  icon        = excluded.icon,
  ideal_for   = excluded.ideal_for,
  sort_order  = excluded.sort_order;






-- Packages (3 tiers per service)
insert into public.service_packages (
  service_id, slug, tier, name, summary, price_cents, deposit_cents,
  timeline_weeks_min, timeline_weeks_max, deliverables, is_popular, sort_order
)
select
  s.id, v.slug, v.tier::public.package_tier, v.name, v.summary, v.price_cents, v.deposit_cents,
  v.weeks_min, v.weeks_max, v.deliverables, v.is_popular, v.sort_order
from (
  values
    -- Corporate Website
    ('corporate-website', 'corporate-website-starter', 'starter', 'Starter',
     'A polished one-page site to launch fast.',
     2500, 500, 1, 1,
     array[
       'Single-page responsive website (up to 5 sections)',
       'Contact form delivered to your inbox',
       'Basic on-page SEO',
       'Analytics setup',
       '3 days of post-launch support'
     ], false, 1),
    ('corporate-website', 'corporate-website-growth', 'growth', 'Growth',
     'A multi-page site your team can manage on its own.',
     5000, 500, 1, 2,
     array[
       'Everything in Starter, plus:',
       'Up to 6 custom-designed pages',
       'CMS to edit content yourself',
       'SEO setup with sitemap and metadata',
       'Forms connected to your CRM',
       'Accessibility review',
       '14 days of post-launch support'
     ], true, 2),
    ('corporate-website', 'corporate-website-scale', 'scale', 'Scale',
     'A content-rich, multilingual site built to grow.',
     10000, 500, 2, 3,
     array[
       'Everything in Growth, plus:',
       'Up to 15 custom-designed pages',
       'Multilingual support (2 languages)',
       'Blog with categories and search',
       'Third-party integrations (booking, live chat, etc.)',
       'Core Web Vitals performance tuning',
       '30 days of post-launch support'
     ], false, 3),

    -- E-commerce Store
    ('ecommerce-store', 'ecommerce-store-starter', 'starter', 'Starter',
     'Start selling online with a simple, reliable store.',
     5000, 500, 1, 2,
     array[
       'Mobile-first storefront',
       'Up to 50 products',
       'Stripe or PayPal checkout',
       'Order notification emails',
       'Admin panel for products and orders',
       '14 days of post-launch support'
     ], false, 1),
    ('ecommerce-store', 'ecommerce-store-growth', 'growth', 'Growth',
     'A full-featured store for a growing catalog.',
     10000, 500, 1, 3,
     array[
       'Everything in Starter, plus:',
       'Up to 500 products with variants and inventory',
       'Customer accounts and order history',
       'Stripe and PayPal payments',
       'Discount codes',
       'Shipping and tax rules',
       '30 days of post-launch support'
     ], true, 2),
    ('ecommerce-store', 'ecommerce-store-scale', 'scale', 'Scale',
     'Advanced commerce with integrations and automation.',
     17500, 500, 2, 4,
     array[
       'Everything in Growth, plus:',
       'Unlimited products',
       'Multi-currency pricing',
       'ERP or inventory system integration',
       'Abandoned cart recovery',
       'Sales analytics dashboard',
       '90 days of post-launch support'
     ], false, 3),



    -- Automation Bots
    ('automation-bots', 'automation-bots-starter', 'starter', 'Starter',
     'Answer common questions automatically on one channel.',
     3000, 500, 1, 1,
     array[
       'WhatsApp, Telegram or Discord bot',
       'FAQ flows for up to 20 topics',
       'Anti spam and rate limiting',
       'Basic analytics dashboard if needed',
       'Message templates and auto-responses',
       'Customizable bot personality',
       'Notification when a human is needed',
       'Deployment and setup guide',
       '7 days of post-launch support'
     ], false, 1),
    ('automation-bots', 'automation-bots-growth', 'growth', 'Growth',
     'Automate bookings or orders and sync them with your tools.',
     5000, 500, 1, 2,
     array[
       'Everything in Starter, plus:',
       'WhatsApp Business API, Discord API and Telegram',
       'Booking or ordering flows',
       'Integration with your CRM, spreadsheet or database',
       'Live handoff to a human agent',
       'Monthly conversation reports and advanced insights',
       '30 days of post-launch support'
     ], true, 2),
    ('automation-bots', 'automation-bots-scale', 'scale', 'Scale',
     'An AI-powered assistant trained on your business knowledge.',
     12000, 500, 2, 4,
     array[
       'Everything in Growth, plus:',
       'AI answers grounded in your knowledge base',
       'Multiple system integrations',
       'Opt-in broadcast campaigns',
       'Admin dashboard',
       'User management and permissions',
       'Fully customizable bot personality and behavior',
       'Uptime monitoring and 60 days of support'
     ], false, 3),



    -- Custom Scripts & Web Scraping
    ('custom-scripts-scraping', 'custom-scripts-scraping-starter', 'starter', 'Starter',
     'One script that automates a single task or data source.',
     2500, 500, 1, 1,
     array[
       'Feasibility and terms-of-use review',
       'One script for one task or website',
       'CSV, Excel or any other export format',
       'Instructions to run it yourself',
        '3 days of post-delivery support'
     ], false, 1),
    ('custom-scripts-scraping', 'custom-scripts-scraping-growth', 'growth', 'Growth',
     'Scheduled automation that runs in the cloud.',
     5000, 500, 1, 2,
     array[
       'Everything in Starter, plus:',
       'Up to 3 sources or tasks',
       'Scheduled cloud runs',
       'Export to Google Sheets or a database',
       'Error handling, logging and failure alerts',
        '30 days of maintenance'
     ], true, 2),
    ('custom-scripts-scraping', 'custom-scripts-scraping-scale', 'scale', 'Scale',
     'A maintained data pipeline with its own API.',
     12000, 500, 3, 4,
     array[
       'Everything in Growth, plus:',
       'Up to 10 sources or tasks',
       'Rate limiting and retry strategy',
       'API endpoint to access your data',
       'Run history dashboard',
       '60 days of maintenance'
     ], false, 3),



    -- Data Science & Analytics
    ('data-science-analytics', 'data-science-analytics-starter', 'starter', 'Starter',
     'Understand what your data is telling you.',
     2500, 500, 1, 1,
     array[
       'Data audit and cleaning (up to 3 datasets)',
       'Exploratory analysis report',
       'Key insights presentation',
       'Google Sheets or Excel dashboard with charts and tables',
       '7 days of support'
     ], false, 1),
    ('data-science-analytics', 'data-science-analytics-growth', 'growth', 'Growth',
     'Track your key metrics in a live dashboard.',
     5000, 500, 1, 2,
     array[
       'Everything in Starter, plus:',
       'Interactive dashboard (Looker Studio, Power BI or Metabase)',
       'KPI definitions workshop',
       'Automated data refresh',
       'Data source integration (up to 3)',
       '30 days of support'
     ], true, 2),
    ('data-science-analytics', 'data-science-analytics-scale', 'scale', 'Scale',
     'Predict what comes next with custom models.',
     12000, 500, 2, 3,
     array[
       'Everything in Growth, plus:',
       'Predictive model (forecasting, churn or segmentation)',
       'Another custom model or dashboard (up to 2)',
       'Automated data pipeline',
       'Model documentation and handover',
       '60 days of support'
     ], false, 3)
) as v (
  service_slug, slug, tier, name, summary, price_cents, deposit_cents,
  weeks_min, weeks_max, deliverables, is_popular, sort_order
)
join public.services s on s.slug = v.service_slug
on conflict (slug) do update set
  name               = excluded.name,
  summary            = excluded.summary,
  price_cents        = excluded.price_cents,
  deposit_cents      = excluded.deposit_cents,
  timeline_weeks_min = excluded.timeline_weeks_min,
  timeline_weeks_max = excluded.timeline_weeks_max,
  deliverables       = excluded.deliverables,
  is_popular         = excluded.is_popular,
  sort_order         = excluded.sort_order;


-- ---------------------------------------------------------------------
-- Scheduling rules
--   Timezone: America/Santiago
--   Every day, including weekends: 10:00-13:00 and 14:00-22:00
--   30-minute calls back to back, which is 22 slots a day
--   24h minimum notice, bookable up to a year ahead
-- ---------------------------------------------------------------------
update public.scheduling_settings set
  timezone              = 'America/Santiago',
  slot_duration_minutes = 30,
  buffer_minutes        = 0,
  min_notice_hours      = 24,
  max_days_ahead        = 365,
  hold_minutes          = 35
where id;

-- Replace the old office-hours rules wholesale.
delete from public.availability_rules
where (weekday, start_time) not in (
  (1, time '10:00'), (1, time '14:00'),
  (2, time '10:00'), (2, time '14:00'),
  (3, time '10:00'), (3, time '14:00'),
  (4, time '10:00'), (4, time '14:00'),
  (5, time '10:00'), (5, time '14:00'),
  (6, time '10:00'), (6, time '14:00'),
  (7, time '10:00'), (7, time '14:00')
);

insert into public.availability_rules (weekday, start_time, end_time)
values
  (1, '10:00', '13:00'), (1, '14:00', '22:00'),
  (2, '10:00', '13:00'), (2, '14:00', '22:00'),
  (3, '10:00', '13:00'), (3, '14:00', '22:00'),
  (4, '10:00', '13:00'), (4, '14:00', '22:00'),
  (5, '10:00', '13:00'), (5, '14:00', '22:00'),
  (6, '10:00', '13:00'), (6, '14:00', '22:00'),
  (7, '10:00', '13:00'), (7, '14:00', '22:00')
on conflict (weekday, start_time) do update set
  end_time  = excluded.end_time,
  is_active = true;