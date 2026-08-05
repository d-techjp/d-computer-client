import { z } from "zod";

/**
 * Every response from the real backend arrives wrapped the same way:
 * `{ success, statusCode, data, timestamp }`, and every list endpoint's
 * `data` is itself `{ items, meta }`. Declaring both once here means a
 * domain schema only has to describe the *entity*, not the envelope around
 * it.
 */
export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function paginatedSchema<Item extends z.ZodTypeAny>(item: Item) {
  return z.object({
    items: z.array(item),
    meta: paginationMetaSchema,
  });
}

/**
 * Accepts a payload either already unwrapped (`{ items, meta }`) or still
 * inside the `{ success, data }` envelope, and normalises to the former.
 *
 * Server-side callers go through `backendFetch`, which always unwraps first —
 * they never need this. It exists for `apiClient` (the browser-facing axios
 * instance): depending on deployment, its `baseURL` either points at this
 * app's own `/api/*` route handlers (which re-emit the bare shape) or, when
 * nginx proxies straight through to the backend, at the raw API (which
 * answers with the full envelope). Browser code that has to work either way
 * uses this instead of the plain schema.
 */
export function envelopeOrPlainSchema<Payload extends z.ZodTypeAny>(payload: Payload) {
  type Data = z.infer<Payload>;
  const envelope = z.object({ success: z.boolean(), data: payload });

  // Zod validates the `z.union` structurally before this runs, so by the time
  // the transform sees a value it is provably one shape or the other — the
  // casts just work around `Payload` being too generic for TS/Zod's mapped
  // types to narrow the union output on their own.
  return z.union([envelope, payload]).transform((value): Data => {
    if (typeof value === "object" && value !== null && "success" in value) {
      return (value as { data: Data }).data;
    }
    return value as Data;
  });
}
