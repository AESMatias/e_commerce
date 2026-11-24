-- New package prices. seed.sql has the same values.
update public.service_packages as p
set price_cents = v.price_cents
from (values
  ('corporate-website-starter',        3000),
  ('corporate-website-growth',         7500),
  ('corporate-website-scale',         12500),
  ('ecommerce-store-starter',          8000),
  ('ecommerce-store-growth',          12500),
  ('ecommerce-store-scale',           20000),
  ('automation-bots-starter',          3000),
  ('automation-bots-growth',           8000),
  ('automation-bots-scale',           15000),
  ('custom-scripts-scraping-starter',  3000),
  ('custom-scripts-scraping-growth',   5500),
  ('custom-scripts-scraping-scale',   12000),
  ('data-science-analytics-starter',   4000),
  ('data-science-analytics-growth',   10000),
  ('data-science-analytics-scale',    16500)
) as v(slug, price_cents)
where p.slug = v.slug;
