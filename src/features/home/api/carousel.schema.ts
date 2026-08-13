import { z } from "zod";

import { productSchema } from "@/features/products/api/product.schema";
import { paginationMetaSchema } from "@/lib/api/envelope";

/** Public payload returned by `GET /carousels/:slug/products`. */
export const publicCarouselSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  subtitle: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null),
  imageUrl: z.string().nullable().optional().default(null),
  filterQuery: z.string().optional().default(""),
  itemLimit: z.number().int().positive().optional().default(20),
  sortOrder: z.number().optional().default(0),
  products: z
    .array(productSchema)
    .nullable()
    .optional()
    .transform((products) => products ?? []),
});

export const publicCarouselListSchema = z.array(publicCarouselSchema);

export const carouselProductsSchema = z.object({
  carousel: publicCarouselSchema,
  items: z.array(productSchema),
  meta: paginationMetaSchema,
});

export type CarouselProducts = z.infer<typeof carouselProductsSchema>;
export type PublicCarousel = z.infer<typeof publicCarouselSchema>;
