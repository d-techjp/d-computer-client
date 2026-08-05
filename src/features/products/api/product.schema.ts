import { z } from "zod";

import { envelopeOrPlainSchema, paginatedSchema } from "@/lib/api/envelope";

/**
 * Runtime contract for anything crossing the network boundary. TypeScript types
 * vanish at runtime; a backend that renames a field or sends `null` would
 * otherwise surface as `undefined is not a function` deep inside a component.
 * Parsing at the edge turns that into one clear error at the call site.
 */
const refSchema = z.object({ id: z.string(), name: z.string(), slug: z.string() });

export const productStatusSchema = z.enum(["draft", "active", "out_of_stock", "archived"]);

/**
 * `specifications` is admin-authored free text (`{ "CPU": "i5-1235U" }`), not
 * a typed facet — coerced to strings defensively in case a value was entered
 * as a number.
 */
const specificationsSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .transform((value) =>
    value
      ? Object.fromEntries(Object.entries(value).map(([key, v]) => [key, String(v)]))
      : null,
  );

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  sku: z.string(),
  name: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  images: z
    .array(z.string())
    .nullable()
    .transform((value) => value ?? []),
  price: z.number(),
  compareAtPrice: z.number().nullable(),
  stock: z.number(),
  status: productStatusSchema,
  isFeatured: z.boolean(),
  viewCount: z.number(),
  specifications: specificationsSchema,
  category: refSchema.nullable(),
  brand: refSchema.nullable(),
});

export const productListSchema = paginatedSchema(productSchema);

/**
 * For `apiClient` (browser) callers only — see `envelopeOrPlainSchema`. Server
 * code that goes through `backendFetch` should keep using `productListSchema`
 * directly; the envelope is already gone by the time it sees the payload.
 */
export const productListResponseSchema = envelopeOrPlainSchema(productListSchema);

/**
 * The long-form product description lives behind its own endpoint rather than
 * on the product entity — it is rich-text HTML from the admin's editor and
 * would bloat every listing response if it rode along with the card fields.
 */
export const productDescriptionSchema = z.object({
  productId: z.string(),
  content: z.string(),
});

export type ProductDto = z.infer<typeof productSchema>;
