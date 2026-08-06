import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/features/products/components/product-detail";
import { productImage, specRows } from "@/features/products/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProduct, getProductDescription } from "@/server/services/product.service";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/**
 * Stock and price change server-side, so this renders dynamically per
 * request rather than being prebuilt at `next build` time — unlike the old
 * mock catalogue, there is no fixed set of slugs to enumerate up front.
 */
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const product = await getProduct(slug);
  if (!product) return {};

  const description = product.shortDescription ?? product.description ?? undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/${locale}/products/${slug}` },
    openGraph: {
      title: product.name,
      description,
      images: [{ url: productImage(product) }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [t, product] = await Promise.all([getDictionary(locale), getProduct(slug)]);

  // Renders the nearest not-found.tsx instead of crashing on `product.name`.
  if (!product) notFound();

  // Sequential rather than concurrent: the description endpoint is keyed by
  // product id, which only exists once the slug lookup above has resolved.
  const description = await getProductDescription(product.id);

  const specs = specRows(product);

  return (
    <div className="shell py-8 md:py-10">
      <Link
        href={`/${locale}/products`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-accent"
      >
        ← {t.detailBack}
      </Link>

      <ProductDetail
        product={product}
        specs={specs}
        specLabels={{
          title: t.detailSpecs,
          showAll: t.specShowAll,
          showLess: t.specShowLess,
        }}
        badges={t.sideBadges.map((badge) => badge.title)}
      />

      {description ? (
        <section className="mt-12 border-t border-line-soft pt-8 md:mt-16 md:pt-10">
          <h2 className="mb-5 border-l-[5px] border-accent pl-3.5 text-[20px] font-black md:text-[24px]">
            {t.detailDescription}
          </h2>
          {/* Capped for readability: body copy running the full 1400px shell
              is a wall of text no one finishes. Same rich-text styling the
              article body uses — both come out of the same admin editor. */}
          <div
            className="rich-text max-w-[860px] text-[14.5px] leading-[1.9] text-ink-body"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      ) : null}
    </div>
  );
}
