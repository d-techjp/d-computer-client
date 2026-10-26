# Rules: data & state

1. Every network response is parsed with a zod schema in `features/*/api/*.schema.ts`. If a feature has
   its own domain type (`types.ts`), keep the type-level assertion so schema and type cannot drift apart.
2. Zustand stores are split by lifecycle (`cart.store` persisted, `ui.store` not). Components subscribe
   only through selector hooks (`useCartCount`…), with `useShallow` for objects/arrays. Never subscribe
   to the whole store.
3. Persisted stores use `skipHydration` + rehydrate in an effect, and read the hydrated flag with
   `useSyncExternalStore` (server snapshot `false`) so markup does not mismatch during hydration.
4. Prefer derived state over extra stored state. No synchronous `setState` inside `useEffect`.
5. Requests driven by user input (search, filters) use an `AbortController`. An aborted request is not
   an error.
6. Independent fetches run in `Promise.all`, never sequentially (no waterfalls).
7. Catch errors as `ApiError` (`lib/api/errors.ts`); never read `err.response?.data`.
