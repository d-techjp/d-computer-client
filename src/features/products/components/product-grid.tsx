import type { Locale } from "@/i18n/config";
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
  locale,
  t,
}: {
  products: Product[];
  locale: Locale;
  t: Dictionary;
}) {
  return (
    // The column count dips back to two at `lg`: that is where the filter
    // sidebar appears and takes ~250px out of the row.
    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 md:gap-[22px] lg:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
          locale={locale}
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
