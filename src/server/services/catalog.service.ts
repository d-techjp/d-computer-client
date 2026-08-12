import "server-only";

import { brandListSchema, categoryListSchema } from "@/features/catalog/api/catalog.schema";
import type { Brand, Category } from "@/features/catalog/types";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * The filter sidebar's category and brand lists. Both are small, mostly
 * static reference data — a single page fetched with a high `limit` rather
 * than something the UI paginates through.
 */
const REFERENCE_LIMIT = 100;

/**
 * Categories now render in the site header, so this runs on *every* page.
 * They change when an admin edits the catalogue structure — rarely — which
 * makes a short revalidation window the right trade rather than an uncached
 * round trip per request. A renamed category shows up within the minute.
 */
const REFERENCE_REVALIDATE_SECONDS = 60;

export async function listCategories(): Promise<Category[]> {
  const data = await backendFetch<unknown>(
    "/categories",
    { limit: REFERENCE_LIMIT, isActive: true, sortBy: "sortOrder", sortOrder: "ASC" },
    { next: { revalidate: REFERENCE_REVALIDATE_SECONDS } },
  );

  return categoryListSchema.parse(data).items;
}

export async function listBrands(): Promise<Brand[]> {
  const data = await backendFetch<unknown>(
    "/brands",
    { limit: REFERENCE_LIMIT, isActive: true, sortBy: "sortOrder", sortOrder: "ASC" },
    { next: { revalidate: REFERENCE_REVALIDATE_SECONDS } },
  );

  return brandListSchema.parse(data).items;
}
