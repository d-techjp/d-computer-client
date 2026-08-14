"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { displayPrice, productImage } from "@/features/products/types";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import { useProductSearch } from "../hooks/use-product-search";

/**
 * Presentation only — all fetching, debouncing and race handling lives in
 * `useProductSearch`, which makes both halves testable on their own.
 *
 * Below `md` the field would eat the whole header row, so it collapses to an
 * icon and the input moves into the results panel. Both breakpoints drive the
 * same `term` state and the same hook; only where the input is mounted changes.
 */
export function ProductSearch() {
  const { locale, t } = useI18n();
  const [term, setTerm] = useState("");

  const { status, results, enabled } = useProductSearch(term);

  const open = useIsPanelOpen("search");
  const openPanel = useUiStore((state) => state.open);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  return (
    // The field is the control at every width — moving the cart to the bottom
    // bar freed the header row on a phone, so the search no longer collapses
    // to an icon that has to open a panel just to show an input.
    <div
      className="relative w-full min-w-0 md:w-[190px] lg:w-[280px] xl:w-[320px]"
      ref={ref}
    >
      <div className="site-header__search flex items-center overflow-hidden rounded-md border bg-[#FAF9F6]">
        <input
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            openPanel("search");
          }}
          onFocus={() => openPanel("search")}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="h-[33px] min-w-0 flex-1 border-none bg-transparent px-3.5 text-[13px] text-ink-body outline-none placeholder:text-ink-faint"
        />
        <span className="flex size-[38px] flex-none items-center justify-center bg-ink-strong text-white">
          <SearchIcon />
        </span>
      </div>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute top-[calc(100%+10px)] right-0 z-60 w-[min(88vw,360px)] overflow-hidden rounded-xl border border-line-soft bg-white shadow-pop",
            // Nothing typed means nothing to list — the input is in the header
            // now, so an empty panel would be a box with no content in it.
            !enabled && "hidden",
          )}
        >
          {!enabled ? null : status === "loading" ? (
            <SearchSkeleton />
          ) : status === "error" ? (
            <p className="px-5 py-8 text-center text-[13px] text-accent">{t.searchError}</p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-ink-subtle">{t.searchEmpty}</p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 border-b border-mist px-4 py-3 transition-colors last:border-b-0 hover:bg-mist-soft"
                  >
                    <span className="relative size-11 flex-none overflow-hidden rounded-lg bg-mist">
                      <Image
                        src={productImage(product)}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{product.name}</span>
                      <span className="block truncate text-[11.5px] text-ink-subtle">
                        {product.shortDescription ?? product.category?.name ?? ""}
                      </span>
                    </span>
                    <span className="flex-none text-[13px] font-bold text-accent tabular-nums">
                      {formatPrice(displayPrice(product))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <ul className="animate-pulse" aria-hidden>
      {[0, 1, 2].map((index) => (
        <li
          key={index}
          className="flex items-center gap-3 border-b border-mist px-4 py-3 last:border-b-0"
        >
          <span className="size-11 flex-none rounded-lg bg-mist" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/3 rounded bg-mist" />
            <span className="block h-2.5 w-1/2 rounded bg-mist" />
          </span>
        </li>
      ))}
    </ul>
  );
}
