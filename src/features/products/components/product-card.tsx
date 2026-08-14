import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import {
  discountPercent,
  displayCompareAtPrice,
  displayPrice,
  isInStock,
  productImage,
  type Product,
} from "../types";

const SHORT_DESCRIPTION_MAX_LENGTH = 66;

function truncateShortDescription(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  const characters = Array.from(text);

  return characters.length > SHORT_DESCRIPTION_MAX_LENGTH
    ? `${characters.slice(0, SHORT_DESCRIPTION_MAX_LENGTH).join("")}...`
    : text;
}

/**
 * Presentational and server-rendered. A `Link` gets crawlability, middle-click
 * and keyboard focus for free — and costs zero client JavaScript.
 *
 * `price` is always shown; `compareAtPrice` (if higher) is struck through
 * beside it — the backend does not carry a standing discount percentage, so
 * the badge only appears when a real markdown exists.
 */
export function ProductCard({
  product,
  locale,
  t,
  priority = false,
  chips,
}: {
  product: Product;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
  /** Short spec pills (category / brand). Caller decides what's most useful in context. */
  chips?: string[];
}) {
  const discount = discountPercent(product);
  const outOfStock = !isInStock(product);
  const price = displayPrice(product);
  const compareAtPrice = displayCompareAtPrice(product);

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      // `h-full` is what keeps a row of cards the same height. Grid and flex
      // both stretch the *cell*, but the card only grew to its own content,
      // so one two-line product name left its neighbours visibly short.
      className="group flex h-full flex-col overflow-hidden border border-line-soft bg-white transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-4/3 overflow-hidden border-b border-line-soft bg-white">
        <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-1.5">
          {product.isFeatured && !outOfStock ? (
            <span className="bg-ink-strong px-2 py-0.5 text-[9px] font-black tracking-[0.7px] text-white md:px-2.5 md:py-1 md:text-[10px]">
              HOT
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="bg-accent px-2 py-0.5 text-[9px] font-black tracking-[0.6px] text-white md:px-2.5 md:py-1 md:text-[10px]">
              SALE {discount}%
            </span>
          ) : null}
        </div>

        <Image
          src={productImage(product)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 25vw, 330px"
          className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.06] md:p-4"
        />
      </div>

      <div className="flex flex-1 flex-col p-2.5 md:p-3.5">
        <span
          className={cn(
            "mb-2 flex items-center gap-1.5 text-[9.5px] font-bold md:mb-2.5 md:text-[10px]",
            outOfStock ? "text-ink-muted" : "text-stock",
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", outOfStock ? "bg-ink-faint" : "bg-stock")}
            aria-hidden
          />
          {outOfStock ? t.badgeOutOfStock : t.detailInStock}
        </span>

        {/* Clamped so one unusually long name cannot stretch every card in
            the row to match it. `min-h` reserves both lines up front, which
            keeps the price rows on the same baseline across the row. */}
        <h3 className="mb-1.5 line-clamp-2 min-h-[2.75em] text-[12.5px] leading-snug font-extrabold transition-colors group-hover:text-accent md:text-[13.5px]">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="mb-2.5 hidden line-clamp-2 text-[11.5px] leading-normal text-ink-subtle md:block">
            {truncateShortDescription(product.shortDescription)}
          </p>
        ) : null}

        {chips && chips.length > 0 ? (
          <ul className="mb-2.5 hidden flex-wrap gap-1 md:flex">
            {chips.map((chip) => (
              <li
                key={chip}
                className="border-l-2 border-line-strong bg-mist-soft px-1.5 py-0.5 text-[9.5px] font-bold text-ink-muted"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto border-t border-line-soft pt-2">
          <span>
            {discount > 0 && compareAtPrice ? (
              <span className="mb-1 block text-[10px] text-ink-faint line-through tabular-nums md:text-[11.5px]">
                {formatPrice(compareAtPrice)}
              </span>
            ) : null}
            <span className="block text-[15px] leading-tight font-black text-accent tabular-nums md:text-[17px]">
              {formatPrice(price)}
            </span>
          </span>
          <span className="mt-2 hidden items-center gap-1.5 text-[9.5px] font-black tracking-[0.6px] text-ink-muted transition-colors group-hover:text-accent md:flex">
            VIEW PRODUCT <span className="text-[15px] leading-none" aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
