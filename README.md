# Wholeheartedly

Productized development services website. An AI advisor recommends a service package,
the client books a kickoff call and pays a deposit through Stripe (test mode).

## Stack

- Next.js (App Router) + React and TypeScript.
- Radix UI Primitives `@radix-ui/react-*`, clean components.
- CSS Modules for all styling.
- Supabase (PostgreSQL) for the catalog, scheduling and bookings.
- Advisor chat: Vercel AI SDK - Google Gemini.
- Stripe for deposits (test mode).

## Getting started

This project requires Node.js 20.9+ and a Supabase PostgreSQL DB.

```bash
npm install
cp .env.example .env.local # Fill with environment variables!
npm run dev
```

## Database

- The database schema is defined in `supabase/migrations`.
- The catalog and scheduling rules are in `supabase/seed.sql`. 

**Option A to initialize the DB using Supabase CLI (recommended)**

```bash
npx supabase login
npx supabase init # keeps the existing migrations and seed
npx supabase link --project-ref <your-project-ref>
npm run db:push # this applies migrations and seed
npm run db:types # regenerates src/types/database.ts
```

**Option B: SQL Editor.** Paste and run the migrations files, then `seed.sql`.

### Security

RLS is enabled on every table of the DB schema, anonymous users can only read active services and packages. Everything else is reachable only from server code with the secret key (`src/lib/supabase/admin.ts`, marked `server-only`).

## AI advisor

The landing page chat runs on Gemini (`gemini-3.6-flash`, overridable with
`GOOGLE_ADVISOR_MODEL`) through the Vercel AI SDK.
Set `GOOGLE_GENERATIVE_AI_API_KEY` from Google AI Studio; without it the endpoint
answers with a 503 and the rest of the site keeps working.

- **Route:** `src/app/api/advisor/route.ts` streams the answer back to the browser.
- **Grounding:** the whole catalog is read from Supabase and rendered into the system
  prompt (`src/lib/advisor/prompt.ts`). The `recommendPackage` tool only accepts slugs
  that exist in the database, so the model cannot invent packages or prices, avoiding errors.
- **Persistence:** every recommendation is stored in `advisor_recommendations`, so a
  booking can later be linked to the conversation that produced it.

For improved security, `src/lib/rate-limit.ts` sets a limit on the requests before they reach Gemini, if:

| Limit         | Value                    | Purpose                                  |
| ------------- | ------------------------ | ---------------------------------------- |
| Global daily  | 1500 requests / 24 h     | Hard ceiling on spending                 |
| Global window | 120 requests / 5 min     | Absorbs bursts and DDoS attempts         |
| Per IP        | 10 requests / 5 min      | Stops one visitor draining the quota     |

(in the previous order, first to be checked is Global daily, then Global window and then Per IP)

Requests over a limit get a 429 with `Retry-After` from the server and never call the model. Conversation length is capped too (30 messages, 8000 characters, 800 output tokens per answer, just to make sure).

Counters live in the server process memory, so each instance has its own. That is enough
for a single instance. `I'm considering using Redis (Upstash) if the app scales out!`

## Stripe - test mode only

This site is an interactive portfolio demo: **checkout always runs in Stripe test mode and no money is ever charged.** `getStripe()` refuses an `sk_live_` key, the booking page shows a demo notice with the test card, and the confirmation page says the payment was a test. The kickoff call itself is a real appointment which can be reviewed in /admin.

Money is never handled by this app: the visitor pays on Stripe's own checkout page, and
Stripe tells us the result through a webhook.

- **Checkout session** (`src/lib/stripe/checkout.ts`): charges the deposit and expires at the
  exact moment our slot hold does, so an abandoned checkout cannot be paid after the slot is
  released. The session id is stored in `payments`.
- **Return from checkout** (`src/lib/booking/confirm.ts`): when Stripe sends the visitor back
  with `?paid=1`, the page asks Stripe whether the session is paid and confirms the booking
  right away. This is what makes local development work without any webhook tooling.
- **Webhook** (`src/app/api/stripe/webhook/route.ts`): verifies Stripe's signature over the
  raw body, stores the event id in `stripe_events` (the primary key makes replays no-ops),
  then calls one database function:
  - `checkout.session.completed` → `confirm_booking_payment`: marks the payment paid and the
    booking confirmed, in one transaction.
  - `checkout.session.expired` → `expire_checkout_session`: releases the slot.
- **Edge case:** if the hold lapsed and someone else took the slot before the payment
  arrived, the booking is cancelled, the payment stays recorded as paid, and the server log
  says the session needs a manual refund or reschedule.

**Clients are never emailed.** The booking page tells them on the spot whether the time was secured, and it is the record of their booking.

**To testing locally without the Stripe CLI** The return page confirms the payment on its own, so the normal flow already works locally. To exercise the webhook path itself, replay it with the script instead of the Stripe CLI:

```bash
npm run payment:simulate              # confirm the latest pending payment
node scripts/simulate-payment.mjs --expire   # release its slot instead
```

It reads the newest pending payment, builds the same `checkout.session.completed` event
Stripe would send, signs it with `STRIPE_WEBHOOK_SECRET` and posts it to the dev server.
Locally that secret can be any string (for example `whsec_local_dev`), because only this app verifies it.
Full local run: start a booking, pay on Stripe with the test card `4242 4242 4242 4242` (any future expiry, any CVC), then run `npm run payment:simulate` to confirm it.

Stripe CLI is an alternative, not a requirement:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**In production no tooling is needed:** we need to create the endpoint in the Stripe dashboard pointing at `https://your-domain/api/stripe/webhook` and copy the `whsec_...` it gives you into the deployment environment. Stripe then calls the endpoint directly.

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Production build
- `npm start` — Serve the production build
- `npm run lint` — ESLint (enforces the styling rules below)
- `npm run lint:css` — Stylelint for all CSS files
- `npm run typecheck` — Generate Next.js types and run TypeScript
- `npm run check` — Typecheck + ESLint + Stylelint
- `npm run db:migrate` — Apply pending SQL migrations to Supabase
- `npm run db:types` — Regenerate database types from the live schema
- `npm run payment:simulate` — Replay a paid Stripe webhook locally (no Stripe CLI)
- `npm run db:push` — Alternative path through the Supabase CLI (unused; needs the CLI linked)


## Styling conventions

**Global CSS is imported only in `src/app/layout.tsx`.** ESLint blocks plain `.css` imports anywhere else.
**All global rules live in cascade layers** (`reset`, `tokens`, `base`). CSS Modules are unlayered, so they always win over globals, independent of stylesheet load order.
**Design tokens are CSS variables on `:root`.** Radix renders Dialogs, Selects and Popovers in a portal attached to `<body>`; tokens on `:root` still reach that content.
4. **One component, one module.** `Button.tsx` imports `Button.module.css`. Class names are camelCase so they read as `styles.className`.
5. **Style Radix state with data attributes** on your own classes, for example `.content[data-state="open"]`, `.item[data-highlighted]`, `.button[data-disabled]`.
6. **CSS Modules are "pure":** every selector must include a local class. Bare selectors such as `body` or `[data-state]` belong in the global layers.
7. **Keyframes are local to the module** that uses them (animation names are hashed too).
8. **Radix wrappers are client components** (`"use client"`) that live in `components/ui`, pages and cards stay as server components and pass serializable props.
9. **Overriding styles through `className`:** import child components before the local `styles` import so their CSS is emitted first and your override wins at equal specificity.