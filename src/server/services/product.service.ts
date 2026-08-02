import "server-only";

import type { Post, Product } from "@/features/products/types";
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
    specTable: record.specTable.map((row) => ({
      label: resolve(row.label, locale),
      value: resolve(row.value, locale),
    })),
  };
}

export async function listProducts(
  locale: Locale,
  options: { query?: string; limit?: number } = {},
): Promise<Product[]> {
  const query = options.query?.trim().toLowerCase();

  let products = PRODUCT_RECORDS.map((record) => toProduct(record, locale));

  if (query) {
    products = products.filter((product) =>
      [product.name, product.specs, product.tag]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  return typeof options.limit === "number" ? products.slice(0, options.limit) : products;
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
