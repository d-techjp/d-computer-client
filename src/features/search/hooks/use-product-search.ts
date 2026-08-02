"use client";

import { useEffect, useState } from "react";

import { searchProducts } from "@/features/products/api/product.repository";
import type { Product } from "@/features/products/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Locale } from "@/i18n/config";
import { ApiError } from "@/lib/api/errors";

export type SearchStatus = "idle" | "loading" | "ready" | "error";

const MIN_QUERY_LENGTH = 2;

/**
 * Debounced product search over the axios repository.
 *
 * Two things here are worth copying:
 *
 *  1. The request is aborted on every new keystroke, so a slow early response
 *     can never land after a later one and overwrite it — the race that shows
 *     you results for "min" after you finished typing "mini".
 *
 *  2. `status` is *derived*, not stored. State only records which query the
 *     last settled response was for; whether we are loading follows from
 *     comparing that against the current query. Storing it as well would mean
 *     writing state synchronously inside the effect and keeping two sources of
 *     truth in sync — the bug that produces a spinner that never stops.
 */
export function useProductSearch(term: string, locale: Locale) {
  const debouncedTerm = useDebouncedValue(term, 300);
  const query = debouncedTerm.trim();
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const [results, setResults] = useState<Product[]>([]);
  const [settledQuery, setSettledQuery] = useState<string | null>(null);
  const [failedQuery, setFailedQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    searchProducts({ locale, query, signal: controller.signal })
      .then((products) => {
        setResults(products);
        setSettledQuery(query);
      })
      .catch((error: unknown) => {
        // An abort is us cancelling a stale request, not a failure to report.
        if (error instanceof ApiError && error.code === "cancelled") return;
        setFailedQuery(query);
      });

    return () => controller.abort();
  }, [enabled, locale, query]);

  const status: SearchStatus = !enabled
    ? "idle"
    : failedQuery === query
      ? "error"
      : settledQuery === query
        ? "ready"
        : "loading";

  return {
    status,
    // Results from a previous query stay in state but must never be shown as
    // if they answered the current one.
    results: status === "ready" ? results : [],
    enabled,
  };
}
