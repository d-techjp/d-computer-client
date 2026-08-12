/**
 * The shared vocabulary of the catalogue listing: what can be filtered, how
 * the whole selection round-trips through the URL, and how it maps onto the
 * backend's query params.
 *
 * It lives outside `server/` on purpose. The service filters with it, the
 * sidebar renders from it, and the route handler validates with it — one
 * definition, so a filter can never mean one thing to the UI and another to
 * the data layer. Nothing here touches React or the network, which keeps it
 * importable from a Server Component and a Client Component alike.
 *
 * Unlike the old mock catalogue, the backend only accepts *one* category and
 * *one* brand per request (`categoryId`, `brandId` — not arrays), so each
 * filter group is single-select: picking a second value replaces the first
 * rather than adding to it.
 */

export const PRICE_BUCKETS = ["entry", "mid", "high", "flagship"] as const;
export type PriceBucket = (typeof PRICE_BUCKETS)[number];

export type PriceBound = { min: number; max: number | null };

/** Bands are authored against the backend's raw numeric price values. */
export const PRICE_BUCKET_BOUNDS: Record<PriceBucket, PriceBound> = {
  entry: { min: 0, max: 10_000_000 },
  mid: { min: 10_000_000, max: 20_000_000 },
  high: { min: 20_000_000, max: 30_000_000 },
  flagship: { min: 30_000_000, max: null },
};

export const SORT_OPTIONS = ["featured", "price-asc", "price-desc", "name"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = "featured";

/** What the backend's `sortBy`/`sortOrder` pair should be for a given UI sort. */
export function sortParams(sort: SortOption): { sortBy: string; sortOrder: "ASC" | "DESC" } {
  switch (sort) {
    case "price-asc":
      return { sortBy: "minPrice", sortOrder: "ASC" };
    case "price-desc":
      return { sortBy: "minPrice", sortOrder: "DESC" };
    case "name":
      return { sortBy: "name", sortOrder: "ASC" };
    case "featured":
      return { sortBy: "createdAt", sortOrder: "DESC" };
  }
}

export type ProductQuery = {
  /** Free-text term, shared with the header search endpoint. */
  q: string;
  categoryId: string;
  brandId: string;
  priceBucket: PriceBucket | "";
  inStock: boolean;
  sort: SortOption;
  page: number;
};

export const EMPTY_QUERY: ProductQuery = {
  q: "",
  categoryId: "",
  brandId: "",
  priceBucket: "",
  inStock: false,
  sort: DEFAULT_SORT,
  page: 1,
};

/* --------------------------------- URL ----------------------------------- */

/** Shape Next hands to a page as `searchParams`, and what `URLSearchParams` yields. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function readParam(params: RawSearchParams, key: string): string | undefined {
  const raw = params[key];
  return (Array.isArray(raw) ? raw[0] : raw)?.trim();
}

/**
 * Turns untrusted query-string input into a `ProductQuery`. An unknown price
 * bucket or sort value is dropped rather than rejected: a hand-edited or
 * stale URL should still render the catalogue, not a 400.
 */
export function parseProductQuery(params: RawSearchParams): ProductQuery {
  const q = readParam(params, "q")?.slice(0, 100) ?? "";

  const priceParam = readParam(params, "price");
  const priceBucket = (PRICE_BUCKETS as readonly string[]).includes(priceParam ?? "")
    ? (priceParam as PriceBucket)
    : "";

  const sortParam = readParam(params, "sort");
  const sort = (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : DEFAULT_SORT;

  const pageParam = Number(readParam(params, "page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  return {
    q,
    categoryId: readParam(params, "category") ?? "",
    brandId: readParam(params, "brand") ?? "",
    priceBucket,
    inStock: readParam(params, "inStock") === "1",
    sort,
    page,
  };
}

export function toSearchParams(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.categoryId) params.set("category", query.categoryId);
  if (query.brandId) params.set("brand", query.brandId);
  if (query.priceBucket) params.set("price", query.priceBucket);
  if (query.inStock) params.set("inStock", "1");
  // The default sort is implied by its absence, keeping the common URL clean.
  if (query.sort !== DEFAULT_SORT) params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));

  return params;
}

/** `""` or `"?category=…&price=mid"`, ready to append to a pathname. */
export function toQueryString(query: ProductQuery): string {
  const params = toSearchParams(query).toString();
  return params ? `?${params}` : "";
}

/**
 * A deep link into the listing pre-filtered to one category — what every
 * category entry point outside `/products` (home rail, promo cards) points at.
 * Built through `toQueryString` so those links can never drift from the param
 * names the page parses.
 */
export function categoryHref(locale: string, categoryId: string): string {
  return `/${locale}/products${toQueryString({ ...EMPTY_QUERY, categoryId })}`;
}

/* ------------------------------- mutation -------------------------------- */

/** Selecting the same value again clears the filter — that is how a single-select group toggles off. */
export function setCategory(query: ProductQuery, categoryId: string): ProductQuery {
  return { ...query, categoryId: query.categoryId === categoryId ? "" : categoryId, page: 1 };
}

export function setBrand(query: ProductQuery, brandId: string): ProductQuery {
  return { ...query, brandId: query.brandId === brandId ? "" : brandId, page: 1 };
}

export function setPriceBucket(query: ProductQuery, bucket: PriceBucket): ProductQuery {
  return { ...query, priceBucket: query.priceBucket === bucket ? "" : bucket, page: 1 };
}

export function setInStock(query: ProductQuery, inStock: boolean): ProductQuery {
  return { ...query, inStock, page: 1 };
}

export function clearFilters(query: ProductQuery): ProductQuery {
  return { ...EMPTY_QUERY, q: query.q, sort: query.sort };
}

export function withSort(query: ProductQuery, sort: SortOption): ProductQuery {
  return { ...query, sort, page: 1 };
}

export function withPage(query: ProductQuery, page: number): ProductQuery {
  return { ...query, page };
}

export function activeFilterCount(query: ProductQuery): number {
  return (
    (query.categoryId ? 1 : 0) +
    (query.brandId ? 1 : 0) +
    (query.priceBucket ? 1 : 0) +
    (query.inStock ? 1 : 0)
  );
}

export type FilterKey = "category" | "brand" | "price" | "inStock";

/** Every active selection, flattened — the source for the "active filter" chips. */
export function activeFilterEntries(
  query: ProductQuery,
): Array<{ key: FilterKey; value: string }> {
  const entries: Array<{ key: FilterKey; value: string }> = [];

  if (query.categoryId) entries.push({ key: "category", value: query.categoryId });
  if (query.brandId) entries.push({ key: "brand", value: query.brandId });
  if (query.priceBucket) entries.push({ key: "price", value: query.priceBucket });
  if (query.inStock) entries.push({ key: "inStock", value: "1" });

  return entries;
}
