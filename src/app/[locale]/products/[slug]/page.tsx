import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BADGE_ICONS } from "@/config/glyphs";
import { AddToCart } from "@/features/products/components/add-to-cart";
import { SpecTable } from "@/features/products/components/spec-table";
import { discountPercent, isInStock, productImage, specRows } from "@/features/products/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format/currency";
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

  const discount = discountPercent(product);
  const outOfStock = !isInStock(product);
  const specs = specRows(product);
  const blurb = product.shortDescription ?? product.description;

  return (
    <div className="shell py-8 md:py-10">
      <Link
        href={`/${locale}/products`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-accent"
      >
        ← {t.detailBack}
      </Link>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-4/3 rounded-2xl bg-mist">
          {outOfStock ? (
            <span className="absolute top-3.5 left-3.5 z-10 rounded bg-ink-strong px-3 py-1.5 text-xs font-bold text-white">
              {t.badgeOutOfStock}
            </span>
          ) : product.isFeatured ? (
            <span className="absolute top-3.5 left-3.5 z-10 rounded bg-ink-strong px-3 py-1.5 text-xs font-bold text-white">
              {t.badgeFeatured}
            </span>
          ) : null}
          <Image
            src={productImage(product)}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 660px"
            className="object-contain"
          />
        </div>

        <div>
          <h1 className="mb-3 text-[26px] leading-[1.25] font-black md:text-[32px]">
            {product.name}
          </h1>

          <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <span className="text-[22px] font-black text-accent tabular-nums md:text-[26px]">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && product.compareAtPrice ? (
              <>
                <span className="text-[15px] font-semibold text-ink-faint line-through tabular-nums">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-md bg-accent/12 px-2.5 py-1 text-xs font-extrabold text-accent">
                  -{discount}%
                </span>
              </>
            ) : null}
          </div>

          {/* The short blurb only. The long rich-text description gets a
              full-width section of its own below the fold-line, where it has
              room to hold headings and images. */}
          {blurb ? (
            <p className="mb-6 text-[14.5px] leading-[1.75] text-ink-muted">{blurb}</p>
          ) : null}

          <AddToCart product={product} disabled={outOfStock} />

          {specs.length > 0 ? (
            <SpecTable
              rows={specs}
              labels={{
                title: t.detailSpecs,
                showAll: t.specShowAll,
                showLess: t.specShowLess,
              }}
            />
          ) : null}

          <ul className="flex flex-col gap-2.5">
            {t.sideBadges.map((badge, index) => {
              const Icon = BADGE_ICONS[index];

              return (
                <li
                  key={badge.title}
                  className="flex items-center gap-2.5 text-[12.5px] text-ink-muted"
                >
                  <span className="text-accent" aria-hidden>
                    <Icon width={15} height={15} />
                  </span>
                  {badge.title}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

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
