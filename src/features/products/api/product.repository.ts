import { apiClient } from "@/lib/api/client";

import type { Product } from "../types";
import type { ProductBundleItem } from "../types";
import { bundleItemListResponseSchema, productListResponseSchema } from "./product.schema";

/**
 * Repository pattern: components ask for *products*, not for a URL.
 *
 * Everything about how products are transported — path, query params, response
 * envelope, validation — is sealed in here. A component that calls
 * `searchProducts()` keeps working if the endpoint moves to GraphQL tomorrow.
 *
 * `apiClient`'s base URL is deployment-dependent: locally (and whenever
 * `NEXT_PUBLIC_API_BASE_URL` is unset) it hits this app's own `/api/products`
 * route handler, same-origin, no CORS to worry about. In production it is set
 * to `/api/v1`, which nginx proxies straight through to the real backend —
 * skipping this app's route handler entirely and coming back with the
 * `{ success, data }` envelope instead of the handler's already-unwrapped
 * shape. `productListResponseSchema` accepts either.
 */
export type SearchProductsParams = {
  query: string;
  limit?: number;
  signal?: AbortSignal;
};

export async function searchProducts({
  query,
  limit = 5,
  signal,
}: SearchProductsParams): Promise<Product[]> {
  const response = await apiClient.get("/products", {
    params: { search: query, limit },
    signal,
  });

  return productListResponseSchema.parse(response.data).items;
}

export async function getBundleItems(variantId: string): Promise<ProductBundleItem[]> {
  const response = await apiClient.get(`/variants/${variantId}/bundle-items`);
  return bundleItemListResponseSchema.parse(response.data);
}
