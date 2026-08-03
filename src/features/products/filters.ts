import type { Locale, Localized } from "@/i18n/config";

/**
 * The shared vocabulary of the catalogue listing: which facets exist, which
 * values each one accepts, and how the whole selection round-trips through the
 * URL.
 *
 * It lives outside `server/` on purpose. The service filters with it, the
 * sidebar renders from it, and the route handler validates with it — one
 * definition, so a facet can never mean one thing to the UI and another to the
 * data layer. Nothing here touches React or the network, which keeps it
 * importable from a Server Component and a Client Component alike.
 */

export const CATEGORIES = ["gaming", "creator", "office"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CPU_BRANDS = ["amd", "intel"] as const;
export type CpuBrand = (typeof CPU_BRANDS)[number];

export const GPU_TIERS = ["rtx40", "rtx30", "radeon", "integrated"] as const;
export type GpuTier = (typeof GPU_TIERS)[number];

/** Kept as strings so RAM shares the generic string-valued facet machinery. */
export const RAM_OPTIONS = ["8", "16", "32", "64"] as const;
export type RamOption = (typeof RAM_OPTIONS)[number];

export const PRICE_BUCKETS = ["entry", "mid", "high", "flagship"] as const;
export type PriceBucket = (typeof PRICE_BUCKETS)[number];

export type PriceBound = {
  min: number;
  /** `null` means open-ended — the top bucket. */
  max: number | null;
};

/**
 * Price bands are authored per storefront rather than converted. The Japanese
 * and Vietnamese stores price independently (see `Product.priceBook`), so a
 * band that reads naturally in yen would land on arbitrary numbers in đồng.
 */
export const PRICE_BUCKET_BOUNDS: Record<PriceBucket, Localized<PriceBound>> = {
  entry: {
    ja: { min: 0, max: 100_000 },
    vi: { min: 0, max: 10_000_000 },
  },
  mid: {
    ja: { min: 100_000, max: 200_000 },
    vi: { min: 10_000_000, max: 20_000_000 },
  },
  high: {
    ja: { min: 200_000, max: 300_000 },
    vi: { min: 20_000_000, max: 30_000_000 },
  },
  flagship: {
    ja: { min: 300_000, max: null },
    vi: { min: 30_000_000, max: null },
  },
};

export function priceBucketBound(bucket: PriceBucket, locale: Locale): PriceBound {
  return PRICE_BUCKET_BOUNDS[bucket][locale];
}

/* ------------------------------------------------------------------------- */

export const FACET_KEYS = ["category", "price", "cpu", "gpu", "ram"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

/** Drives both rendering order in the sidebar and validation of URL input. */
export const FACET_OPTIONS = {
  category: CATEGORIES,
  price: PRICE_BUCKETS,
  cpu: CPU_BRANDS,
  gpu: GPU_TIERS,
  ram: RAM_OPTIONS,
} as const satisfies Record<FacetKey, readonly string[]>;

export const SORT_OPTIONS = ["featured", "price-asc", "price-desc", "name"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = "featured";

/** Values chosen per facet. Empty array = that facet is not narrowing anything. */
export type FacetSelection = Record<FacetKey, string[]>;

export type ProductQuery = {
  facets: FacetSelection;
  sort: SortOption;
  /** Free-text term, shared with the header search endpoint. */
  q: string;
};

export function emptySelection(): FacetSelection {
  return { category: [], price: [], cpu: [], gpu: [], ram: [] };
}

export const EMPTY_QUERY: ProductQuery = {
  facets: emptySelection(),
  sort: DEFAULT_SORT,
  q: "",
};

/* --------------------------------- URL ----------------------------------- */

/** Shape Next hands to a page as `searchParams`, and what `URLSearchParams` yields. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

const SEPARATOR = ",";

function readParam(params: RawSearchParams, key: string): string[] {
  const raw = params[key];
  if (raw === undefined) return [];

  // Accept both `?ram=16&ram=32` and `?ram=16,32`; emit only the latter.
  return (Array.isArray(raw) ? raw : [raw])
    .flatMap((value) => value.split(SEPARATOR))
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Turns untrusted query-string input into a `ProductQuery`. Unknown facet
 * values, unknown sorts and duplicates are dropped rather than rejected: a
 * hand-edited or stale URL should still render the catalogue, not a 400.
 */
export function parseProductQuery(params: RawSearchParams): ProductQuery {
  const facets = emptySelection();

  for (const key of FACET_KEYS) {
    const allowed = FACET_OPTIONS[key] as readonly string[];
    const selected = readParam(params, key).filter((value) => allowed.includes(value));
    // Store in declaration order so two equivalent URLs serialise identically.
    facets[key] = allowed.filter((value) => selected.includes(value));
  }

  const sortParam = readParam(params, "sort")[0];
  const sort = (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : DEFAULT_SORT;

  const qRaw = params.q;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw)?.trim().slice(0, 100) ?? "";

  return { facets, sort, q };
}

export function toSearchParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of FACET_KEYS) {
    const values = query.facets[key];
    if (values.length > 0) params.set(key, values.join(SEPARATOR));
  }

  if (query.q) params.set("q", query.q);
  // The default sort is implied by its absence, keeping the common URL clean.
  if (query.sort !== DEFAULT_SORT) params.set("sort", query.sort);

  return params;
}

/** `""` or `"?category=gaming&ram=32"`, ready to append to a pathname. */
export function toQueryString(query: ProductQuery): string {
  const params = toSearchParams(query).toString();
  return params ? `?${params}` : "";
}

/* ------------------------------- mutation -------------------------------- */

export function isFacetSelected(query: ProductQuery, key: FacetKey, value: string): boolean {
  return query.facets[key].includes(value);
}

export function toggleFacet(query: ProductQuery, key: FacetKey, value: string): ProductQuery {
  const current = query.facets[key];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return {
    ...query,
    facets: {
      ...query.facets,
      // Re-derive from the canonical order rather than appending.
      [key]: (FACET_OPTIONS[key] as readonly string[]).filter((item) => next.includes(item)),
    },
  };
}

export function clearFacets(query: ProductQuery): ProductQuery {
  return { ...query, facets: emptySelection() };
}

export function withSort(query: ProductQuery, sort: SortOption): ProductQuery {
  return { ...query, sort };
}

export function activeFacetCount(query: ProductQuery): number {
  return FACET_KEYS.reduce((total, key) => total + query.facets[key].length, 0);
}

/** Every selected value, flattened — the source for the "active filter" chips. */
export function activeFacetEntries(
  query: ProductQuery,
): Array<{ key: FacetKey; value: string }> {
  return FACET_KEYS.flatMap((key) =>
    query.facets[key].map((value) => ({ key, value })),
  );
}
