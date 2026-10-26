# Rules: file size limits

Count **logic lines only**: exclude imports, blank lines, comments and type/interface declarations.
JSX counts.

| File type | Target | Hard cap (must split) | When / how to split |
|---|---|---|---|
| `components/ui/*` primitive | 30–80 | 120 | Business logic here is misplaced; move it into a feature |
| `page.tsx` / `layout.tsx` | ≤ 80 | 120 | Only fetch + compose sections. Sections → `features/*/components` |
| Route handler `app/api/**` | ≤ 40 | 60 | No business logic; push it into `server/services` |
| Feature component (server) | ≤ 120 | 200 | Extract sub-sections once the JSX has more than 3 large blocks |
| Feature component (client, stateful) | ≤ 180 | 250 | Move state/effects into `use-xxx.ts`, sub-components into their own files |
| Multi-step flow (checkout, product detail) | ≤ 200 | 300 | One file per step or panel, shared state in one hook |
| Custom hook | 30–120 | 180 | One purpose per hook |
| Zustand store | ≤ 150 | 250 | Move async actions into a separate file, keep the store thin |
| `server/services/*` | ≤ 150 | 250 | Split by domain |
| `*.repository.ts` | ≤ 120 | 200 | Split by API domain |
| Utility / helper | 10–80 | 120 | Functions with different purposes go in different files |
| `*.schema.ts`, `types.ts`, dictionaries, constants, CSS | No fixed limit | — | Split by domain when hard to navigate |

- Functions and sub-components: target ≤ 50 lines. Several components in one file are fine only when
  they are private parts of the main component and the whole file stays under the cap.
- Files already over the cap (`checkout-flow.tsx` 773, `product-detail.tsx` 620, `cart.store.ts` 386):
  do not add new logic to them. Put new code in a separate file and import it. Refactor the whole file
  only when asked.
