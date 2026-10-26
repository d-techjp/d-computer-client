# Rules: server / client boundary & data fetching

1. Server Components by default. Put `"use client"` only on leaves that need state, effects or events.
   Client components receive `children` from the server instead of pulling the whole tree to the client.
2. The server never `fetch`es its own `/api/*` routes; it calls `server/services`.
3. Server code imports `"server-only"`. Never import `server/*` or `get-dictionary` from a client component.
4. The browser never calls the backend directly: client component → `features/*/api/*.repository.ts` →
   `apiClient` → `/api/*` route handler → backend.
5. Only `lib/api/client.ts` imports `axios`. Components call repository functions, never URLs.
6. New route handlers follow `app/api/checkout/route.ts`: `safeParse` the input → `backendFetch` →
   `schema.parse` the output → errors via `apiRouteError()`. Forward `Authorization` with
   `optionalAuthorization`.
7. `backendFetch` defaults to `no-store` (prices and stock change constantly). Only reference data
   (categories, brands) passes `next: { revalidate }`.
8. Next 16: `params` / `searchParams` are `Promise`s and must be awaited. Middleware lives in `proxy.ts`.
