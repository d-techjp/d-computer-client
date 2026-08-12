"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@/features/products/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { useScrollCarousel } from "../hooks/use-scroll-carousel";
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
  const { ref, step, pause, resume } = useScrollCarousel<HTMLUListElement>(products.length);

  if (products.length === 0) return null;

  return (
    <RevealSection className="shell py-12 md:py-16">
      <SectionHeading
        title={t.productsTitle}
        action={t.viewAll}
        actionHref={`/${locale}/products`}
      />

      <div
        className="relative"
        // Autoplay yields while the visitor is reading a card or tabbing
        // through one — sliding out from under a pointer is the thing that
        // makes auto-advancing carousels infuriating.
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        <ul
          ref={ref}
          // `pb-8` is not decorative: `overflow-x` forces the vertical axis to
          // scroll too, which would otherwise clip the cards' hover lift and
          // drop shadow.
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pt-1 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-[22px] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <li
              key={product.slug}
              // The larger home container would make a four-up carousel much
              // bigger than the PLP grid beside its filter rail. Four-up at
              // `md` and five-up at `lg` keep the cards equally dense while a
              // visible sliver still signals that the track can be scrolled.
              className="w-[78%] flex-none snap-start xs:w-[46%] md:w-[23.4%] lg:w-[18.4%]"
            >
              <ProductCard product={product} locale={locale} t={t} priority={index < 2} />
            </li>
          ))}
        </ul>

        {/* Below `md` the track is swiped, so arrows would just cover a card. */}
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t.paginationPrev}
          className="absolute top-[30%] -left-4 z-10 hidden size-9 cursor-pointer items-center justify-center rounded-full border border-line-soft bg-white text-ink shadow-card transition-colors hover:border-accent hover:text-accent md:flex"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t.paginationNext}
          className="absolute top-[30%] -right-4 z-10 hidden size-9 cursor-pointer items-center justify-center rounded-full border border-line-soft bg-white text-ink shadow-card transition-colors hover:border-accent hover:text-accent md:flex"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </RevealSection>
  );
}
