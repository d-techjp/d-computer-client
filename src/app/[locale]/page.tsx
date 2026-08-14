import { notFound } from "next/navigation";

import { BlogSection } from "@/features/home/components/blog-section";
import { CustomPcSection } from "@/features/home/components/custom-pc-section";
import { Hero } from "@/features/home/components/hero";
import { ProductCarousel } from "@/features/home/components/product-carousel";
import { TrustBar } from "@/features/home/components/trust-bar";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listArticles } from "@/server/services/article.service";
import { listHomeCarousels } from "@/server/services/carousel.service";

// Stock, prices and featured flags come from the live backend — this page
// must never be frozen into a static HTML file at build time.
export const dynamic = "force-dynamic";

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
  const [t, articleListing, carousels] = await Promise.all([
    getDictionary(locale),
    listArticles({ limit: FEATURED_ARTICLES_LIMIT }),
    listHomeCarousels(),
  ]);

  return (
    <>
      <Hero />
      <TrustBar t={t} />
      {carousels.map((carousel) => (
        <ProductCarousel key={carousel.id} carousel={carousel} locale={locale} />
      ))}
      <CustomPcSection t={t} />
      <BlogSection articles={articleListing.articles} locale={locale} t={t} />
    </>
  );
}
