"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { productImage } from "@/features/products/types";
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
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  const field = (autoFocus: boolean) => (
    <input
      value={term}
      autoFocus={autoFocus}
      onChange={(event) => {
        setTerm(event.target.value);
        openPanel("search");
      }}
      onFocus={() => openPanel("search")}
      placeholder={t.searchPlaceholder}
      aria-label={t.searchPlaceholder}
      className="h-[33px] min-w-0 flex-1 border-none bg-transparent px-3.5 text-[13px] text-ink-body outline-none placeholder:text-ink-faint"
    />
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => toggle("search")}
        aria-expanded={open}
        aria-label={t.searchPlaceholder}
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line-strong bg-white text-ink transition-colors hover:border-accent hover:text-accent md:hidden"
      >
        <SearchIcon />
      </button>

      <div className="hidden items-center overflow-hidden rounded-lg border border-line-strong bg-white focus-within:border-accent md:flex md:w-[190px] lg:w-[213px]">
        {field(false)}
        <span className="flex size-[38px] flex-none items-center justify-center bg-ink-strong text-white">
          <SearchIcon />
        </span>
      </div>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute top-[calc(100%+10px)] right-0 z-60 w-[min(88vw,360px)] overflow-hidden rounded-xl border border-line-soft bg-white shadow-pop",
            // With nothing typed the panel holds only the mobile input, so on
            // desktop — where the input lives in the header — it has no reason
            // to exist yet.
            !enabled && "md:hidden",
          )}
        >
          <div className="flex items-center border-b border-line-faint md:hidden">
            {field(true)}
            <span className="flex size-[38px] flex-none items-center justify-center bg-ink-strong text-white">
              <SearchIcon />
            </span>
          </div>

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
                      {formatPrice(product.price)}
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
