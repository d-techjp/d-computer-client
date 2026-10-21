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
    // `data-home-carousel`: the hero's scroll arrow aims at the first of these.
    <RevealSection data-home-carousel="" className="shell py-7 md:py-9">
      <SectionHeading title={title} action={t.viewAll} actionHref={`/${locale}/products`} />

      {/*
        Từ md trở lên mỗi lần hiện đúng 4 (md) / 5 (lg) card, bề rộng card tính
        từ khung trừ đi các khoảng `gap-[22px]` — tổng vừa khít khung, nên card
        cuối chạm đúng mép phải và hai nút nằm giữa mép card hai bên. (Bản cũ
        dùng 23.4% / 18.4% cộng gap không đủ 100%, card cuối hụt vào trong.)

        `@container` để nút tính được vị trí theo bề rộng khung: ảnh trong card
        là khung vuông rộng bằng thẻ <li>, nên tâm ảnh nằm ở `pt-1` (4px) + nửa
        bề rộng card. Đổi số card / gap thì sửa cả bề rộng <li> lẫn `top` của nút.
      */}
      <div
        className="@container relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        <ul
          ref={ref}
          {...dragHandlers}
          onDragStart={(event) => event.preventDefault()}
          className="flex cursor-grab gap-4 overflow-x-auto pt-1 pb-6 select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] md:gap-[22px] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <li
              key={product.slug}
              className="w-[78%] flex-none xs:w-[46%] md:w-[calc((100%-3*22px)/4)] lg:w-[calc((100%-4*22px)/5)]"
            >
              <ProductCard product={product} locale={locale} t={t} priority={index < 2} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t.paginationPrev}
          className="absolute top-[calc(4px+(100cqw-3*22px)/8)] -left-[18px] z-10 -translate-y-1/2 lg:top-[calc(4px+(100cqw-4*22px)/10)] hidden size-9 cursor-pointer items-center justify-center rounded-full border border-line-soft bg-white text-ink shadow-card transition-colors hover:border-accent hover:text-accent md:flex"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t.paginationNext}
          className="absolute top-[calc(4px+(100cqw-3*22px)/8)] -right-[18px] z-10 -translate-y-1/2 lg:top-[calc(4px+(100cqw-4*22px)/10)] hidden size-9 cursor-pointer items-center justify-center rounded-full border border-line-soft bg-white text-ink shadow-card transition-colors hover:border-accent hover:text-accent md:flex"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </RevealSection>
  );
}
