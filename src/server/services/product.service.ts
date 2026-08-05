import "server-only";

import {
  productDescriptionSchema,
  productListSchema,
  productSchema,
} from "@/features/products/api/product.schema";
import {
  DEFAULT_SORT,
  PRICE_BUCKET_BOUNDS,
  sortParams,
  type ProductQuery,
  type SortOption,
} from "@/features/products/filters";
import type { Product } from "@/features/products/types";
import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * The single place that talks to the backend's `/products` endpoints. Route
 * handlers and Server Components both go through here, so a query-param
 * mapping can never drift between the internal BFF route and a
 * server-rendered page.
 *
 * `status: "active"` is applied by default everywhere: `draft` and
 * `archived` products exist for the admin, not the storefront.
 */
const PAGE_SIZE = 12;
const PUBLIC_STATUS = "active";

export type ListProductsOptions = {
  search?: string;
  limit?: number;
  isFeatured?: boolean;
};

export async function listProducts(options: ListProductsOptions = {}): Promise<Product[]> {
  const data = await backendFetch<unknown>("/products", {
    search: options.search,
    limit: options.limit,
    isFeatured: options.isFeatured,
    status: PUBLIC_STATUS,
  });

  return productListSchema.parse(data).items;
}

export type ProductListing = {
  products: Product[];
  /** Products matching the current query, before paging. */
  total: number;
  totalPages: number;
  page: number;
};

export async function listProductPage(query: ProductQuery): Promise<ProductListing> {
  const bounds = query.priceBucket ? PRICE_BUCKET_BOUNDS[query.priceBucket] : null;
  const { sortBy, sortOrder } = sortParams(query.sort ?? DEFAULT_SORT);

  const data = await backendFetch<unknown>("/products", {
    search: query.q || undefined,
    categoryId: query.categoryId || undefined,
    includeSubCategories: query.categoryId ? true : undefined,
    brandId: query.brandId || undefined,
    minPrice: bounds?.min,
    maxPrice: bounds?.max ?? undefined,
    inStock: query.inStock || undefined,
    sortBy,
    sortOrder,
    page: query.page,
    limit: PAGE_SIZE,
    status: PUBLIC_STATUS,
  });

  const parsed = productListSchema.parse(data);

  return {
    products: parsed.items,
    total: parsed.meta.total,
    totalPages: parsed.meta.totalPages,
    page: parsed.meta.page,
  };
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const data = await backendFetch<unknown>(`/products/slug/${encodeURIComponent(slug)}`);
    return productSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Rich-text HTML for the detail page's description section. Keyed by product
 * *id*, so it can only be fetched once `getProduct` has resolved the slug —
 * an unavoidable second hop given the endpoint's shape.
 *
 * A product with no description yet is the normal case, not an error: the
 * endpoint answers with an empty string, and a 404 is folded into the same
 * "nothing to render" result.
 */
export async function getProductDescription(id: string): Promise<string> {
  try {
    const data = await backendFetch<unknown>(
      `/products/${encodeURIComponent(id)}/description`,
    );
    return productDescriptionSchema.parse(data).content.trim();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return "";
    throw error;
  }
}

export type { SortOption };
