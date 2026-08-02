import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format/currency";

import type { Product } from "../types";

/**
 * Presentational and server-rendered. The original made the whole card a
 * `div` with an onClick handler, which meant no href for crawlers, no
 * middle-click, no keyboard focus. A `Link` gets all of that for free — and
 * costs zero client JavaScript.
 */
export function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-line-soft bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-4/3 bg-mist">
        <span className="absolute top-2.5 left-2.5 z-10 rounded bg-ink-strong px-2.5 py-1 text-[11px] font-bold text-white">
          {product.tag}
        </span>
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 25vw, 350px"
          className="object-contain"
        />
      </div>

      <div className="p-4">
        <h3 className="mb-1.5 text-[15px] font-bold">{product.name}</h3>
        <p className="mb-3 text-[12.5px] leading-normal text-ink-subtle">{product.specs}</p>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-black text-accent tabular-nums">
            {formatPrice(product.price, product.currency)}
          </span>
          <span
            className="flex size-[30px] items-center justify-center rounded-full bg-mist transition-colors group-hover:bg-accent group-hover:text-white"
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
