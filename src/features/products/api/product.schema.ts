import { z } from "zod";

import type { Product } from "../types";

/**
 * Runtime contract for anything crossing the network boundary. TypeScript types
 * vanish at runtime; a backend that renames a field or sends `null` would
 * otherwise surface as `undefined is not a function` deep inside a component.
 * Parsing at the edge turns that into one clear error at the call site.
 */
export const specRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  tag: z.string(),
  specs: z.string(),
  description: z.string(),
  image: z.string(),
  currency: z.enum(["JPY", "VND"]),
  price: z.number(),
  salePrice: z.number(),
  discountPercent: z.number(),
  specTable: z.array(specRowSchema),
  priceBook: z.object({ ja: z.number(), vi: z.number() }),
});

export const productListSchema = z.object({
  data: z.array(productSchema),
});

// Fails to compile if the schema and the domain type drift apart.
export type ProductDto = z.infer<typeof productSchema>;
const _assertShape: ProductDto extends Product ? true : never = true;
void _assertShape;
