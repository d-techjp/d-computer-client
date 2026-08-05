import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductBrowser } from "@/features/products/components/product-browser";
import { ProductGrid } from "@/features/products/components/product-grid";
import {
  DEFAULT_SORT,
  activeFilterCount,
  parseProductQuery,
  type RawSearchParams,
} from "@/features/products/filters";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listCategories, listBrands } from "@/server/services/catalog.service";
import { listProductPage } from "@/server/services/product.service";

// Filtering, sorting and paging all resolve against the live backend — this
// page must never be frozen into a static HTML file at build time.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  const query = parseProductQuery(rawSearchParams);

  // Every filter combination is a distinct URL over the same catalogue. The
  // unfiltered listing is the page worth indexing; the permutations point their
  // canonical at it and stay out of the index, which is the standard way to
  // avoid drowning a site in near-duplicate result pages.
  const isFiltered =
    activeFilterCount(query) > 0 || query.sort !== DEFAULT_SORT || query.q !== "" || query.page > 1;

  return {
    title: t.listTitle,
    description: t.listDesc,
    alternates: { canonical: `/${locale}/products` },
    ...(isFiltered ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * The catalogue listing. A Server Component that reads the filter state
 * straight out of `searchParams`, so the first paint already shows the
 * filtered, sorted, paginated result — no client fetch, no spinner, and a
 * shared link renders exactly what the sender saw.
 */
export default async function ProductsPage({ params, searchParams }: PageProps) {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const query = parseProductQuery(rawSearchParams);

  const [t, listing, categories, brands] = await Promise.all([
    getDictionary(locale),
    listProductPage(query),
    listCategories(),
    listBrands(),
  ]);

  return (
    <div className="shell py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-ink-muted">
        <Link href={`/${locale}`} className="transition-colors hover:text-accent">
          {t.navItems[0]}
        </Link>
        <span className="mx-2 text-ink-faint" aria-hidden>
          /
        </span>
        <span className="font-semibold text-ink-body">{t.listTitle}</span>
      </nav>

      <header className="mb-7 max-w-[720px]">
        <h1 className="mb-2.5 border-l-[5px] border-accent pl-3.5 text-[26px] leading-tight font-black md:text-[32px]">
          {t.listTitle}
        </h1>
        <p className="text-[13.5px] leading-[1.75] text-ink-muted md:text-[14.5px]">
          {t.listDesc}
        </p>
      </header>

      <ProductBrowser
        query={query}
        categories={categories}
        brands={brands}
        total={listing.total}
        totalPages={listing.totalPages}
      >
        {listing.products.length > 0 ? (
          <ProductGrid products={listing.products} locale={locale} t={t} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="mb-2 text-base font-bold">{t.listEmptyTitle}</p>
            <p className="text-[13.5px] text-ink-muted">{t.listEmptyDesc}</p>
          </div>
        )}
      </ProductBrowser>
    </div>
  );
}
