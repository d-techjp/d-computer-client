import { z } from "zod";

import { CATEGORIES, CPU_BRANDS, GPU_TIERS, RAM_OPTIONS } from "../filters";
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

export const productAttributesSchema = z.object({
  category: z.enum(CATEGORIES),
  cpuBrand: z.enum(CPU_BRANDS),
  gpu: z.enum(GPU_TIERS),
  ram: z.enum(RAM_OPTIONS),
  storageGb: z.number(),
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
  attributes: productAttributesSchema,
  priceBook: z.object({ ja: z.number(), vi: z.number() }),
});

export const productListSchema = z.object({
  data: z.array(productSchema),
});

// Fails to compile if the schema and the domain type drift apart.
export type ProductDto = z.infer<typeof productSchema>;
const _assertShape: ProductDto extends Product ? true : never = true;
void _assertShape;
