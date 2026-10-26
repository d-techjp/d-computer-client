# d-computer-client (storefront)

Online store for D-Tech (computers / electronics, Japan). Bilingual: **ja (default) / vi**.
Data comes from the NestJS backend `../d-computer-service`. The admin back-office is `../d-computer-admin-client`.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand 5 · Axios · Zod 4 · CVA.

## Commands

```bash
npm run dev        # :3000, `/` redirects to /ja or /vi
npm run lint && npx tsc --noEmit && npm run build   # run before reporting done
```

`.env.local`: `API_BASE_URL=http://localhost:3030/api/v1` (server-side only). The current API contract
is `../d-computer-service/openapi/openapi.client.yaml`; the copies in this repo's `openapi/` are stale.

## Architecture

```
src/
├── app/[locale]/        # routing + composition. page.tsx is a Server Component calling server/services
├── app/api/**/route.ts  # BFF: validate (zod) → backendFetch → parse schema → return JSON
├── features/<feature>/  # articles, cart, catalog, checkout, home, layout, products, search
│   ├── api/             # *.schema.ts (zod, shared server+client), *.repository.ts (browser → /api)
│   ├── components/ hooks/ store/ types.ts
├── server/              # "server-only": lib/backend-fetch.ts, services/*.service.ts
├── lib/api/             # client.ts = the ONLY axios instance, errors.ts (ApiError), envelope.ts
├── lib/format/          # currency, date, interpolate
├── components/ui/       # primitives: Button (CVA), icons, pagination, quantity-stepper
├── i18n/                # config, dictionaries/{ja,vi}.ts, get-dictionary (server-only), provider
├── hooks/               # shared hooks
└── proxy.ts             # Next 16 middleware: picks locale from Accept-Language
```

**Two data paths:**
- Server Component → `server/services/*` → `backendFetch()` calls the backend directly (`no-store` by
  default; reference data such as categories/brands passes `next: { revalidate }`).
- Client Component → `features/*/api/*.repository.ts` → `apiClient` → `/api/*` (route handler) → backend.
  The browser **never** calls the backend directly.

**Main flows:** the cart lives on the backend (`cartId` is persisted in `cart.store`, with
`skipHydration` + rehydrate in an effect). Checkout (`checkout-flow.tsx`): COD creates the order
immediately; Stripe creates a session → redirects to Stripe → returns to
`/[locale]/checkout/success?session_id=` → `stripe-payment-result.tsx` syncs the session. A cancelled
payment returns to `?payment=cancelled`. Prices are JPY integers, tax included.

## Rules

Detailed rules live in `.claude/rules/` (auto-loaded):
`server-client-boundary.md` · `data-and-state.md` · `ui-and-i18n.md` · `file-size.md`.

## Deploy

Pushing `main` triggers GitHub Actions: build Docker image (`output: standalone`) → VPS
`docker compose up -d d-computer-client` (prod port 5000). **Pushing main deploys to production**, so
ask before pushing.
