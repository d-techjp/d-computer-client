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
export const productTypeSchema = z.enum(["standard", "bundle", "service"]);
export const bundleInventoryPolicySchema = z.enum(["derived_from_components", "own_stock"]);

/**
 * `specifications` is admin-authored ordered display data, not a typed facet.
 * Values are coerced defensively in case an admin-entered number comes through.
 */
const specificationItemSchema = z.object({
  name: z.string(),
  value: z.unknown().transform((value) => String(value)),
  position: z.number().optional().default(0),
});

const specificationsSchema = z
  .union([
    z.array(specificationItemSchema),
    z.record(z.string(), z.unknown()).transform((value) =>
      Object.entries(value).map(([name, specValue], position) => ({
        name,
        value: String(specValue),
        position,
      })),
    ),
  ])
  .nullable()
  .optional()
  .transform((value) => value ?? null);

const imageListSchema = z
  .array(z.string())
  .nullable()
  .optional()
  .transform((value) => value ?? []);

const optionRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.number().optional().default(0),
});

const optionValueSchema = z.object({
  id: z.string(),
  optionId: z.string(),
  value: z.string(),
  position: z.number().optional().default(0),
  option: optionRefSchema.optional(),
});

export const productOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.number().optional().default(0),
  values: z
    .array(
      z.object({
        id: z.string(),
        optionId: z.string(),
        value: z.string(),
        position: z.number().optional().default(0),
      }),
    )
    .optional()
    .default([]),
});

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  barcode: z.string().nullable().optional().default(null),
  price: z.number(),
  compareAtPrice: z.number().nullable().optional().default(null),
  stock: z.number().optional().default(0),
  lowStockThreshold: z.number().optional().default(0),
  weightGrams: z.number().nullable().optional().default(null),
  thumbnail: z.string().nullable().optional().default(null),
  images: imageListSchema,
  position: z.number().optional().default(0),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  trackInventory: z.boolean().optional().default(true),
  bundleInventoryPolicy: bundleInventoryPolicySchema.nullable().optional().default(null),
  soldCount: z.number().optional().default(0),
  optionValues: z.array(optionValueSchema).optional().default([]),
});

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  productType: productTypeSchema.optional().default("standard"),
  shortDescription: z.string().nullable(),
  description: z.string().nullable().optional().default(null),
  thumbnail: z.string().nullable(),
  images: imageListSchema,
  hasVariants: z.boolean().optional().default(false),
  minPrice: z.number().nullable().optional().default(null),
  maxPrice: z.number().nullable().optional().default(null),
  totalStock: z.number().optional().default(0),
  stock: z.number().optional().default(0),
  status: productStatusSchema,
  isFeatured: z.boolean(),
  viewCount: z.number(),
  soldCount: z.number().optional().default(0),
  specifications: specificationsSchema,
  category: refSchema.nullable(),
  brand: refSchema.nullable(),
  variants: z.array(productVariantSchema).optional().default([]),
  options: z.array(productOptionSchema).optional().default([]),
  galleryImages: imageListSchema,
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

export const bundleItemSchema = z.object({
  id: z.string(),
  bundleVariantId: z.string(),
  componentVariantId: z.string(),
  quantity: z.number().optional().default(1),
  position: z.number().optional().default(0),
  isOptional: z.boolean().optional().default(false),
  componentVariant: productVariantSchema
    .extend({
      product: z
        .object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          thumbnail: z.string().nullable().optional().default(null),
        })
        .optional(),
    })
    .optional(),
});

export const bundleItemListSchema = z.array(bundleItemSchema);
export const bundleItemListResponseSchema = envelopeOrPlainSchema(bundleItemListSchema);

export type ProductDto = z.infer<typeof productSchema>;
