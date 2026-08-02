import { notFound } from "next/navigation";

import { BlogSection } from "@/features/home/components/blog-section";
import { CustomPcSection } from "@/features/home/components/custom-pc-section";
import { FeaturedProducts } from "@/features/home/components/featured-products";
import { Hero } from "@/features/home/components/hero";
import { TrustBar } from "@/features/home/components/trust-bar";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listPosts, listProducts } from "@/server/services/product.service";

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
  const [t, products, posts] = await Promise.all([
    getDictionary(locale),
    listProducts(locale),
    listPosts(locale),
  ]);

  return (
    <>
      <Hero />
      <TrustBar t={t} />
      <FeaturedProducts products={products} locale={locale} t={t} />
      <CustomPcSection t={t} />
      <BlogSection posts={posts} locale={locale} t={t} />
    </>
  );
}
