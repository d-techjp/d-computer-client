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
import { getProduct } from "@/server/services/product.service";

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

  const discount = discountPercent(product);
  const outOfStock = !isInStock(product);
  const specs = specRows(product);

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

          {product.description ? (
            <p className="mb-6 text-[14.5px] leading-[1.75] text-ink-muted">
              {product.description}
            </p>
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
    </div>
  );
}
