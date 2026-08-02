"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";

import { useProductSearch } from "../hooks/use-product-search";

/**
 * Presentation only — all fetching, debouncing and race handling lives in
 * `useProductSearch`, which makes both halves testable on their own.
 */
export function ProductSearch() {
  const { locale, t } = useI18n();
  const [term, setTerm] = useState("");

  const { status, results, enabled } = useProductSearch(term, locale);

  const open = useIsPanelOpen("search");
  const openPanel = useUiStore((state) => state.open);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center overflow-hidden rounded-lg border border-line-strong bg-white focus-within:border-accent">
        <input
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            openPanel("search");
          }}
          onFocus={() => openPanel("search")}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="h-[33px] w-[213px] border-none bg-transparent px-3.5 text-[13px] text-ink-body outline-none placeholder:text-ink-faint"
        />
        <span className="flex size-[38px] flex-none items-center justify-center bg-ink-strong text-white">
          <SearchIcon />
        </span>
      </div>

      {open && enabled ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+10px)] right-0 z-60 w-[360px] overflow-hidden rounded-xl border border-line-soft bg-white shadow-pop"
        >
          {status === "loading" ? (
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
                      <Image src={product.image} alt="" fill sizes="44px" className="object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{product.name}</span>
                      <span className="block truncate text-[11.5px] text-ink-subtle">
                        {product.specs}
                      </span>
                    </span>
                    <span className="flex-none text-[13px] font-bold text-accent tabular-nums">
                      {formatPrice(product.salePrice, product.currency)}
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
