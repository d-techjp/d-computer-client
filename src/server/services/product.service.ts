import "server-only";

import {
  FACET_KEYS,
  FACET_OPTIONS,
  priceBucketBound,
  type FacetKey,
  type FacetSelection,
  type PriceBucket,
  type ProductQuery,
  type SortOption,
} from "@/features/products/filters";
import type { FacetCounts, Post, Product } from "@/features/products/types";
import { LOCALE_CURRENCY, resolve, type Locale } from "@/i18n/config";
import { POST_RECORDS } from "@/server/data/posts";
import { DISCOUNT_PERCENT, PRODUCT_RECORDS, type ProductRecord } from "@/server/data/products";

/**
 * The single place that turns storage records into the `Product` domain object:
 * picks the locale, picks the currency, applies the discount. Route handlers
 * and Server Components both go through here, so a pricing rule can never drift
 * between the API and a server-rendered page.
 *
 * Swapping the in-memory arrays for Prisma/an upstream HTTP call is a change
 * confined to this file.
 */
function toProduct(record: ProductRecord, locale: Locale): Product {
  const price = resolve(record.price, locale);

  return {
    slug: record.slug,
    name: record.name,
    image: record.image,
    tag: resolve(record.tag, locale),
    specs: resolve(record.specs, locale),
    description: resolve(record.description, locale),
    currency: LOCALE_CURRENCY[locale],
    price,
    salePrice: Math.round(price * (1 - DISCOUNT_PERCENT / 100)),
    discountPercent: DISCOUNT_PERCENT,
    priceBook: { ...record.price },
    attributes: { ...record.attributes },
    specTable: record.specTable.map((row) => ({
      label: resolve(row.label, locale),
      value: resolve(row.value, locale),
    })),
  };
}

function matchesText(product: Product, query: string): boolean {
  return [product.name, product.specs, product.tag]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/**
 * Whether a product satisfies one facet group. Values inside a group are OR'd —
 * ticking "16GB" and "32GB" widens the result rather than asking for a machine
 * that is somehow both.
 */
function matchesFacet(
  product: Product,
  key: FacetKey,
  values: string[],
  locale: Locale,
): boolean {
  if (values.length === 0) return true;

  const { attributes } = product;

  switch (key) {
    case "category":
      return values.includes(attributes.category);
    case "cpu":
      return values.includes(attributes.cpuBrand);
    case "gpu":
      return values.includes(attributes.gpu);
    case "ram":
      return values.includes(attributes.ram);
    case "price":
      // Bands are compared against the list price, which is what the filter
      // labels show; the discount is uniform so it cannot reorder the bands.
      return values.some((bucket) => {
        const { min, max } = priceBucketBound(bucket as PriceBucket, locale);
        return product.price >= min && (max === null || product.price < max);
      });
  }
}

/** Groups are AND'd: every ticked group must be satisfied. */
function matchesSelection(
  product: Product,
  facets: FacetSelection,
  locale: Locale,
  except?: FacetKey,
): boolean {
  return FACET_KEYS.every(
    (key) => key === except || matchesFacet(product, key, facets[key], locale),
  );
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  switch (sort) {
    case "price-asc":
      return [...products].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...products].sort((a, b) => b.price - a.price);
    case "name":
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
      // Authoring order in the catalogue is the merchandising order.
      return products;
  }
}

export type ListProductsOptions = {
  query?: string;
  limit?: number;
  facets?: FacetSelection;
  sort?: SortOption;
};

export async function listProducts(
  locale: Locale,
  options: ListProductsOptions = {},
): Promise<Product[]> {
  const query = options.query?.trim().toLowerCase();

  let products = PRODUCT_RECORDS.map((record) => toProduct(record, locale));

  const { facets } = options;

  if (query) products = products.filter((product) => matchesText(product, query));
  if (facets) products = products.filter((product) => matchesSelection(product, facets, locale));

  products = sortProducts(products, options.sort ?? "featured");

  return typeof options.limit === "number" ? products.slice(0, options.limit) : products;
}

export type ProductListing = {
  products: Product[];
  /** Products matching the current query, before any paging. */
  total: number;
  /** Size of the whole catalogue, for the "showing X of Y" line. */
  catalogueTotal: number;
  facets: FacetCounts;
};

/**
 * Everything the listing page needs in one pass: the matching products plus the
 * option counts beside each checkbox.
 *
 * A facet's own selection is *excluded* when counting it — otherwise ticking
 * "Gaming" would immediately show `Creator (0)`, and every filter you applied
 * would look like it broke the ones next to it. Counting each group against the
 * other groups is the behaviour every storefront facet has.
 */
export async function listProductPage(
  locale: Locale,
  query: ProductQuery,
): Promise<ProductListing> {
  const term = query.q.trim().toLowerCase();

  const catalogue = PRODUCT_RECORDS.map((record) => toProduct(record, locale));
  const searched = term ? catalogue.filter((product) => matchesText(product, term)) : catalogue;

  const products = sortProducts(
    searched.filter((product) => matchesSelection(product, query.facets, locale)),
    query.sort,
  );

  const facets = Object.fromEntries(
    FACET_KEYS.map((key) => {
      const pool = searched.filter((product) =>
        matchesSelection(product, query.facets, locale, key),
      );

      const counts = Object.fromEntries(
        (FACET_OPTIONS[key] as readonly string[]).map((value) => [
          value,
          pool.filter((product) => matchesFacet(product, key, [value], locale)).length,
        ]),
      );

      return [key, counts];
    }),
  ) as FacetCounts;

  return {
    products,
    total: products.length,
    catalogueTotal: catalogue.length,
    facets,
  };
}

export async function getProduct(locale: Locale, slug: string): Promise<Product | null> {
  const record = PRODUCT_RECORDS.find((item) => item.slug === slug);
  return record ? toProduct(record, locale) : null;
}

/** Used by `generateStaticParams` to prerender every product page. */
export function listProductSlugs(): string[] {
  return PRODUCT_RECORDS.map((record) => record.slug);
}

export async function listPosts(locale: Locale): Promise<Post[]> {
  return POST_RECORDS.map((record) => ({
    slug: record.slug,
    date: record.date,
    image: record.image,
    tag: resolve(record.tag, locale),
    title: resolve(record.title, locale),
  }));
}
