import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@/features/products/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

export function FeaturedProducts({
  products,
  locale,
  t,
}: {
  products: Product[];
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <RevealSection className="shell py-12 md:py-16">
      <SectionHeading
        title={t.productsTitle}
        action={t.viewAll}
        actionHref={`/${locale}/products`}
      />
      {/* Mobile-first min-width cascade — mixing this with a `max-lg:` override
          put two conflicting max-width rules at equal specificity, and
          Tailwind's generated order let the wider one win under 420px. */}
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:gap-[22px] lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            locale={locale}
            priority={index < 2}
          />
        ))}
      </div>
    </RevealSection>
  );
}
