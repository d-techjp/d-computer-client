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
