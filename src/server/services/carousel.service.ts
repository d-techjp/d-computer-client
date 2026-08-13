import "server-only";

import {
  carouselProductsSchema,
  publicCarouselListSchema,
  type CarouselProducts,
  type PublicCarousel,
} from "@/features/home/api/carousel.schema";
import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * Homepage payload: all active carousels in admin-defined display order, each
 * with up to its configured `itemLimit` products. This avoids one request per
 * carousel as the homepage grows.
 */
export async function listHomeCarousels(): Promise<PublicCarousel[]> {
  const data = await backendFetch<unknown>("/carousels", { includeProducts: true });
  return publicCarouselListSchema.parse(data);
}

/**
 * Reads a storefront carousel by its stable admin-managed slug. A missing or
 * inactive carousel is normal for a homepage section that has been removed.
 */
export async function getCarouselProducts(slug: string): Promise<CarouselProducts | null> {
  try {
    const data = await backendFetch<unknown>(
      `/carousels/${encodeURIComponent(slug)}/products`,
    );

    return carouselProductsSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
