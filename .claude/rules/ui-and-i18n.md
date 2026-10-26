# Rules: UI & i18n

1. No hard-coded user-facing strings. Add the key to `i18n/dictionaries/ja.ts` first (`vi.ts` is typed
   from `ja`, so a missing key is a compile error). Always translate both languages.
2. Internal links always carry the `/${locale}` prefix. Format money and dates with `lib/format/*`,
   never by hand. Money is JPY integers, tax included.
3. Colors and spacing use the `@theme` tokens in `globals.css`; no literal `oklch(...)` or hex in components.
4. Component variants use CVA; merge classes with `cn()` so the caller's `className` wins on conflict.
5. Images use `next/image`. External image hosts must be added to `remotePatterns` (currently only `**.r2.dev`).
6. Code comments are written in **English** (existing repo convention) and explain why.
7. Before reporting done: `npm run lint && npx tsc --noEmit && npm run build`.
