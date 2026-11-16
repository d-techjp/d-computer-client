"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { displayPrice, productImage } from "@/features/products/types";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import { useProductSearch } from "../hooks/use-product-search";
import {
  highlightParts,
  isSoldOut,
  keySpecsLine,
  searchTokens,
  type HighlightPart,
} from "../lib/search-display";

/**
 * Presentation only — all fetching, debouncing and race handling lives in
 * `useProductSearch`, which makes both halves testable on their own.
 *
 * Below `md` the field would eat the whole header row, so it collapses to an
 * icon and the input moves into the results panel. Both breakpoints drive the
 * same `term` state and the same hook; only where the input is mounted changes.
 */
export function ProductSearch() {
  const { t } = useI18n();
  const [term, setTerm] = useState("");

  const { status, results, enabled } = useProductSearch(term);
  const tokens = useMemo(() => searchTokens(term), [term]);

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
            "absolute top-[calc(100%+10px)] right-0 z-60 w-[min(92vw,440px)] overflow-hidden rounded-xl border border-line-soft bg-white shadow-pop",
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
              {results.map((product) => {
                const soldOut = isSoldOut(product);
                return (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 border-b border-mist px-4 py-3 transition-colors last:border-b-0 hover:bg-mist-soft"
                    >
                      <span className="relative size-12 flex-none overflow-hidden rounded-lg bg-mist">
                        <Image
                          src={productImage(product)}
                          alt=""
                          fill
                          sizes="48px"
                          className={cn("object-contain", soldOut && "opacity-50")}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        {/* Two lines, not truncate: PC names carry the specs
                            people search by, cut off they look identical. */}
                        <span className="line-clamp-2 text-[13px] leading-snug font-semibold text-ink-body">
                          <Highlighted parts={highlightParts(product.name, tokens)} />
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-ink-subtle">
                          <Highlighted parts={highlightParts(keySpecsLine(product), tokens)} />
                        </span>
                      </span>
                      <span className="flex flex-none flex-col items-end gap-1">
                        <span
                          className={cn(
                            "text-[13px] font-bold tabular-nums",
                            soldOut ? "text-ink-faint" : "text-accent",
                          )}
                        >
                          {formatPrice(displayPrice(product))}
                        </span>
                        {soldOut ? (
                          <span className="rounded bg-mist px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-subtle">
                            {t.badgeOutOfStock}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Bolds the runs that matched the query; plain text otherwise. */
function Highlighted({ parts }: { parts: HighlightPart[] }) {
  return parts.map((part, index) =>
    part.match ? (
      <mark key={index} className="bg-transparent font-bold text-accent">
        {part.text}
      </mark>
    ) : (
      <span key={index}>{part.text}</span>
    ),
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
          <span className="size-12 flex-none rounded-lg bg-mist" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/3 rounded bg-mist" />
            <span className="block h-2.5 w-1/2 rounded bg-mist" />
          </span>
        </li>
      ))}
    </ul>
  );
}
