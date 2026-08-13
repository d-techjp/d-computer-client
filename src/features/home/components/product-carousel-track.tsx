"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/i18n/i18n-provider";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@/features/products/types";
import type { Locale } from "@/i18n/config";

import { useScrollCarousel } from "../hooks/use-scroll-carousel";
import { RevealSection } from "./reveal-section";

export function ProductCarouselTrack({
  products,
  locale,
  title,
}: {
  products: Product[];
  locale: Locale;
  title: string;
}) {
  const { t } = useI18n();
  const { ref, step, pause, resume, dragHandlers } = useScrollCarousel<HTMLUListElement>(products.length);

  return (
    <RevealSection className="shell py-7 md:py-9">
      <SectionHeading title={title} action={t.viewAll} actionHref={`/${locale}/products`} />

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        <ul
          ref={ref}
          {...dragHandlers}
          onDragStart={(event) => event.preventDefault()}
          className="flex cursor-grab touch-pan-y gap-4 overflow-x-auto pt-1 pb-6 select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] md:gap-[22px] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <li
              key={product.slug}
              className="w-[78%] flex-none xs:w-[46%] md:w-[23.4%] lg:w-[18.4%]"
            >
              <ProductCard product={product} locale={locale} t={t} priority={index < 2} />
            </li>
          ))}
        </ul>

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
