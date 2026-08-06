"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { BADGE_ICONS } from "@/config/glyphs";
import { useCartActions } from "@/features/cart/store/cart.store";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import { getBundleItems } from "../api/product.repository";
import {
  defaultVariant,
  isVariantInStock,
  productGalleryImages,
  productImage,
  variantDiscountPercent,
  variantImages,
  type Product,
  type ProductBundleItem,
  type ProductVariant,
  type SpecRow,
} from "../types";
import { SpecTable } from "./spec-table";

type ProductDetailProps = {
  product: Product;
  specs: SpecRow[];
  specLabels: {
    title: string;
    showAll: string;
    showLess: string;
  };
  badges: string[];
};

export function ProductDetail({
  product,
  specs,
  specLabels,
  badges,
}: ProductDetailProps) {
  const { t } = useI18n();
  const initialVariant = defaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? initialVariant,
    [initialVariant, product.variants, selectedVariantId],
  );
  const images = useMemo(() => {
    const selectedImages = variantImages(product, selectedVariant);
    return selectedImages.length > 0 ? selectedImages : [productImage(product)];
  }, [product, selectedVariant]);
  const allImages = useMemo(() => {
    const gallery = productGalleryImages(product);
    return gallery.length > 0 ? gallery : [productImage(product)];
  }, [product]);
  const displayedImages = useMemo(
    () => uniqueImages([...images, ...allImages]),
    [allImages, images],
  );
  const [selectedImageOverride, setSelectedImageOverride] = useState<{
    variantId: string;
    image: string;
  } | null>(null);
  const overrideImage =
    selectedImageOverride && selectedImageOverride.variantId === selectedVariant?.id
      ? selectedImageOverride.image
      : null;
  const selectedImage =
    overrideImage && displayedImages.includes(overrideImage) ? overrideImage : images[0];
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addVariant } = useCartActions();
  const openPanel = useUiStore((state) => state.open);

  const discount = selectedVariant ? variantDiscountPercent(selectedVariant) : 0;
  const outOfStock = product.status !== "active" || !isVariantInStock(selectedVariant);
  const showVariantPicker = product.hasVariants || product.variants.length > 1;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addVariant(product, selectedVariant, quantity);
    openPanel("cart");
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-14">
        <section aria-label={t.detailSelectedImage}>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-mist">
            {outOfStock ? (
              <span className="absolute top-3.5 left-3.5 z-10 rounded bg-ink-strong px-3 py-1.5 text-xs font-bold text-white">
                {t.badgeOutOfStock}
              </span>
            ) : product.isFeatured ? (
              <span className="absolute top-3.5 left-3.5 z-10 rounded bg-ink-strong px-3 py-1.5 text-xs font-bold text-white">
                {t.badgeFeatured}
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => setPreviewImage(selectedImage)}
              aria-label={t.detailOpenImage}
              className="absolute inset-0 cursor-zoom-in"
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 660px"
                className="object-contain p-4"
              />
            </button>
          </div>

          <ImageStrip
            images={displayedImages}
            selectedImage={selectedImage}
            productName={product.name}
            onSelect={(image) =>
              setSelectedImageOverride({ variantId: selectedVariant?.id ?? "", image })
            }
          />
        </section>

        <section>
          <h1 className="mb-3 text-[26px] leading-[1.25] font-black md:text-[32px]">
            {product.name}
          </h1>

          {selectedVariant ? (
            <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <span className="text-[22px] font-black text-accent tabular-nums md:text-[26px]">
                {formatPrice(selectedVariant.price)}
              </span>
              {discount > 0 && selectedVariant.compareAtPrice ? (
                <>
                  <span className="text-[15px] font-semibold text-ink-faint line-through tabular-nums">
                    {formatPrice(selectedVariant.compareAtPrice)}
                  </span>
                  <span className="rounded-md bg-accent/12 px-2.5 py-1 text-xs font-extrabold text-accent">
                    -{discount}%
                  </span>
                </>
              ) : null}
            </div>
          ) : null}

          <VariantMeta variant={selectedVariant} />

          {product.shortDescription ?? product.description ? (
            <p className="mb-6 text-[14.5px] leading-[1.75] text-ink-muted">
              {product.shortDescription ?? product.description}
            </p>
          ) : null}

          {showVariantPicker ? (
            <VariantPicker
              product={product}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariantId}
            />
          ) : null}

          {product.productType === "bundle" && selectedVariant ? (
            <BundlePanel variant={selectedVariant} />
          ) : null}

          <div className="mb-6 flex items-center gap-4">
            <QuantityStepper
              value={quantity}
              onIncrement={() => setQuantity((value) => value + 1)}
              onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
              labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
            />
            <Button
              onClick={handleAdd}
              disabled={outOfStock || !selectedVariant}
              className="flex-1"
            >
              {outOfStock ? t.badgeOutOfStock : t.detailAddToCart}
            </Button>
          </div>

          {specs.length > 0 ? <SpecTable rows={specs} labels={specLabels} /> : null}

          <ul className="flex flex-col gap-2.5">
            {badges.map((badge, index) => {
              const Icon = BADGE_ICONS[index];

              return (
                <li key={badge} className="flex items-center gap-2.5 text-[12.5px] text-ink-muted">
                  {Icon ? (
                    <span className="text-accent" aria-hidden>
                      <Icon width={15} height={15} />
                    </span>
                  ) : null}
                  {badge}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {previewImage ? (
        <ImagePreview
          image={previewImage}
          productName={product.name}
          onClose={() => setPreviewImage(null)}
        />
      ) : null}
    </>
  );
}

function ImageStrip({
  images,
  selectedImage,
  productName,
  onSelect,
}: {
  images: string[];
  selectedImage: string;
  productName: string;
  onSelect: (image: string) => void;
}) {
  if (images.length <= 1) return null;

  return (
    <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 cursor-pointer">
      {images.map((image, index) => (
        <button
          key={image}
          type="button"
          onClick={() => onSelect(image)}
          className={cn(
            "relative aspect-square overflow-hidden rounded-lg border bg-white transition-colors",
            image === selectedImage ? "border-accent" : "border-line-soft hover:border-line-strong",
          )}
        >
          <Image
            src={image}
            alt={`${productName} ${index + 1}`}
            fill
            sizes="96px"
            className="object-contain p-1.5"
          />
        </button>
      ))}
    </div>
  );
}

function VariantMeta({ variant }: { variant: ProductVariant | null }) {
  const { t } = useI18n();
  if (!variant) return null;

  return (
    <dl className="mb-5 flex flex-wrap gap-2 text-[12.5px]">
      <div className="rounded border border-line-soft bg-mist-soft px-2.5 py-1.5">
        <dt className="sr-only">{t.detailSku}</dt>
        <dd className="font-semibold text-ink-muted">{variant.sku}</dd>
      </div>
      <div className="rounded border border-line-soft bg-mist-soft px-2.5 py-1.5">
        <dt className="sr-only">{t.detailStock}</dt>
        <dd className="font-semibold text-ink-muted">
          {variant.trackInventory ? `${t.detailStock}: ${variant.stock}` : t.detailInStock}
        </dd>
      </div>
    </dl>
  );
}

function VariantPicker({
  product,
  selectedVariant,
  onSelect,
}: {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelect: (variantId: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="mb-6">
      <h2 className="mb-2.5 text-sm font-bold">{t.detailVariant}</h2>
      <div className="grid grid-cols-2 gap-2">
        {product.variants.map((variant) => {
          const active = variant.id === selectedVariant?.id;
          const disabled = !isVariantInStock(variant);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id)}
              disabled={!variant.isActive}
              aria-pressed={active}
              className={cn(
                "flex min-h-[96px] min-w-0 flex-col rounded-lg border px-2.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 sm:px-3",
                active ? "border-accent bg-accent/8" : "border-line-soft bg-white hover:border-accent",
              )}
            >
              <span className="line-clamp-2 min-w-0 text-[12.5px] leading-snug font-bold text-ink-body sm:text-[13px]">
                {variant.name}
              </span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {variant.optionValues.map((value) => (
                  <span
                    key={value.id}
                    className="rounded bg-mist px-1.5 py-[3px] text-[10.5px] font-semibold text-ink-muted sm:px-2 sm:text-[11px]"
                  >
                    {value.option?.name ? `${value.option.name}: ` : ""}
                    {value.value}
                  </span>
                ))}
                {disabled ? (
                  <span className="rounded bg-ink-strong px-2 py-[3px] text-[11px] font-semibold text-white">
                    {t.badgeOutOfStock}
                  </span>
                ) : null}
              </span>
              <span className="mt-auto pt-2">
                <span className="block text-[12.5px] font-black text-accent tabular-nums sm:text-[13px]">
                  {formatPrice(variant.price)}
                </span>
                {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
                  <span className="block text-[11px] font-semibold text-ink-faint line-through tabular-nums">
                    {formatPrice(variant.compareAtPrice)}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BundlePanel({ variant }: { variant: ProductVariant }) {
  const { t } = useI18n();
  const [result, setResult] = useState<{
    variantId: string;
    items: ProductBundleItem[];
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;

    getBundleItems(variant.id)
      .then((result) => {
        if (active) setResult({ variantId: variant.id, items: result, failed: false });
      })
      .catch(() => {
        if (active) setResult({ variantId: variant.id, items: [], failed: true });
      });

    return () => {
      active = false;
    };
  }, [variant.id]);

  return (
    <section className="mb-6 rounded-xl border border-line-soft bg-mist-soft p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold">{t.detailBundleTitle}</h2>
      </div>

      {!result || result.variantId !== variant.id ? (
        <p className="text-[13px] text-ink-subtle">{t.detailBundleLoading}</p>
      ) : result.failed || result.items.length === 0 ? (
        <p className="text-[13px] text-ink-subtle">{t.detailBundleEmpty}</p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {result.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="relative size-12 flex-none overflow-hidden rounded-lg bg-white">
                <Image
                  src={
                    item.componentVariant?.thumbnail ??
                    item.componentVariant?.product?.thumbnail ??
                    "/images/pc1.png"
                  }
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-ink-body">
                  {item.componentVariant?.product?.name ?? item.componentVariant?.name}
                </span>
                <span className="block truncate text-[11.5px] text-ink-subtle">
                  {item.componentVariant?.name} · {item.componentVariant?.sku}
                </span>
              </span>
              <span className="flex-none text-[12px] font-bold text-ink-muted">
                x{item.quantity}
                {item.isOptional ? ` · ${t.detailOptionalBundleItem}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ImagePreview({
  image,
  productName,
  onClose,
}: {
  image: string;
  productName: string;
  onClose: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink-strong/80 p-4">
      <button type="button" className="absolute inset-0 cursor-zoom-out" onClick={onClose}>
        <span className="sr-only">{t.detailCloseImage}</span>
      </button>
      <div className="relative h-[86vh] w-full max-w-5xl">
        <Image src={image} alt={productName} fill sizes="100vw" className="object-contain" />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t.detailCloseImage}
        className="absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-ink-body shadow-pop transition-colors hover:text-accent"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function uniqueImages(images: string[]): string[] {
  return Array.from(new Set(images));
}
