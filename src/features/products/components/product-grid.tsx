import type { Dictionary } from "@/i18n/get-dictionary";

import type { Product } from "../types";
import { ProductCard } from "./product-card";

/**
 * Server-rendered results grid. It is handed to `<ProductBrowser>` as
 * `children`, which keeps the cards out of the client bundle even though the
 * filter chrome around them is interactive.
 */
export function ProductGrid({
  products,
  t,
}: {
  products: Product[];
  t: Dictionary;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
         
          t={t}
          priority={index < 3}
          chips={[product.category?.name, product.brand?.name].filter((value): value is string =>
            Boolean(value),
          )}
        />
      ))}
    </div>
  );
}
