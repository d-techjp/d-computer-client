import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format/currency";

import { discountPercent, isInStock, productImage, type Product } from "../types";

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

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line-soft bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-4/3 bg-mist">
        {outOfStock ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded bg-ink-strong px-2.5 py-1 text-[11px] font-bold text-white">
            {t.badgeOutOfStock}
          </span>
        ) : product.isFeatured ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded bg-ink-strong px-2.5 py-1 text-[11px] font-bold text-white">
            {t.badgeFeatured}
          </span>
        ) : null}

        {discount > 0 ? (
          <span className="absolute top-2.5 right-2.5 z-10 rounded bg-accent px-2 py-1 text-[11px] font-extrabold text-white">
            -{discount}%
          </span>
        ) : null}

        <Image
          src={productImage(product)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 25vw, 330px"
          className="object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 text-[15px] font-bold">{product.name}</h3>
        {product.shortDescription ? (
          <p className="mb-3 text-[12.5px] leading-normal text-ink-subtle">
            {product.shortDescription}
          </p>
        ) : null}

        {chips && chips.length > 0 ? (
          <ul className="mb-3.5 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded border border-line-soft bg-mist-soft px-2 py-[3px] text-[11px] font-semibold text-ink-muted"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2">
          <span>
            <span className="block text-[17px] leading-tight font-black text-accent tabular-nums">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && product.compareAtPrice ? (
              <span className="block text-[11.5px] text-ink-faint line-through tabular-nums">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </span>
          <span
            className="flex size-[30px] flex-none items-center justify-center rounded-full bg-mist transition-colors group-hover:bg-accent group-hover:text-white"
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
