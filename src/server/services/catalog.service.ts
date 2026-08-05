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

export async function listCategories(): Promise<Category[]> {
  const data = await backendFetch<unknown>("/categories", {
    limit: REFERENCE_LIMIT,
    isActive: true,
    sortBy: "sortOrder",
    sortOrder: "ASC",
  });

  return categoryListSchema.parse(data).items;
}

export async function listBrands(): Promise<Brand[]> {
  const data = await backendFetch<unknown>("/brands", {
    limit: REFERENCE_LIMIT,
    isActive: true,
    sortBy: "sortOrder",
    sortOrder: "ASC",
  });

  return brandListSchema.parse(data).items;
}
