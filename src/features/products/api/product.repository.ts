import { apiClient } from "@/lib/api/client";
import type { Locale } from "@/i18n/config";

import type { Product } from "../types";
import { productListSchema } from "./product.schema";

/**
 * Repository pattern: components ask for *products*, not for a URL.
 *
 * Everything about how products are transported — path, query params, response
 * envelope, validation — is sealed in here. A component that calls
 * `searchProducts()` keeps working if the endpoint moves to GraphQL tomorrow.
 */
export type SearchProductsParams = {
  locale: Locale;
  query: string;
  limit?: number;
  signal?: AbortSignal;
};

export async function searchProducts({
  locale,
  query,
  limit = 5,
  signal,
}: SearchProductsParams): Promise<Product[]> {
  const response = await apiClient.get("/products", {
    params: { locale, q: query, limit },
    signal,
  });

  return productListSchema.parse(response.data).data;
}
