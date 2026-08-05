import { notFound } from "next/navigation";

import { BlogSection } from "@/features/home/components/blog-section";
import { CustomPcSection } from "@/features/home/components/custom-pc-section";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { Hero } from "@/features/home/components/hero";
import { TrustBar } from "@/features/home/components/trust-bar";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listArticles } from "@/server/services/article.service";
import { listProducts } from "@/server/services/product.service";

// Stock, prices and featured flags come from the live backend — this page
// must never be frozen into a static HTML file at build time.
export const dynamic = "force-dynamic";

// Products feed a sliding carousel (3 per panel), so it takes a deeper list
// than the plain 4-across article teaser grid below it.
const FEATURED_PRODUCTS_LIMIT = 10;
const FEATURED_ARTICLES_LIMIT = 4;

/**
 * A Server Component. It reads the data layer *directly* rather than fetching
 * its own `/api/products` route — a server calling its own HTTP endpoint is a
 * pointless round trip through the network stack. The route handler exists for
 * the browser; the service exists for both.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Independent reads run concurrently instead of serialising into a waterfall.
  const [t, featured, articleListing] = await Promise.all([
    getDictionary(locale),
    // The home page shows a shortlist; the full catalogue lives at /products.
    listProducts({ limit: FEATURED_PRODUCTS_LIMIT, isFeatured: true }),
    listArticles({ limit: FEATURED_ARTICLES_LIMIT }),
  ]);

  // Falls back to the plain catalogue when nothing is flagged `isFeatured`
  // yet, so the section is never empty on a freshly seeded catalogue.
  const products =
    featured.length > 0 ? featured : await listProducts({ limit: FEATURED_PRODUCTS_LIMIT });

  return (
    <>
      <Hero />
      <TrustBar t={t} />
      <FeaturedProducts products={products} locale={locale} t={t} />
      <CustomPcSection t={t} />
      <BlogSection articles={articleListing.articles} locale={locale} t={t} />
    </>
  );
}
