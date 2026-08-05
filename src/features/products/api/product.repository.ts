import { apiClient } from "@/lib/api/client";

import type { Product } from "../types";
import { productListSchema } from "./product.schema";

/**
 * Repository pattern: components ask for *products*, not for a URL.
 *
 * Everything about how products are transported — path, query params, response
 * envelope, validation — is sealed in here. A component that calls
 * `searchProducts()` keeps working if the endpoint moves to GraphQL tomorrow.
 *
 * This hits the internal `/api/products` route rather than the real backend
 * directly: the browser calling a third-party origin needs that origin's
 * CORS policy to cooperate, while a same-origin Next.js route handler has no
 * such dependency.
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

  return productListSchema.parse(response.data).items;
}
