"use client";

import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { CartIcon, CloseIcon, PhoneIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import {
  useCartActions,
  useCartBusy,
  useCartCount,
  useCartError,
  useCartHasBlockingIssues,
  useCartLastMutation,
  useCartLines,
  useCartLoading,
  useCartSubtotal,
} from "@/features/cart/store/cart.store";
import { useCartHydrated } from "@/features/cart/store/use-cart-hydrated";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

const CONTACT_PHONE = "08064732260";

export function CartPageView() {
  const { locale, t } = useI18n();
  const hydrated = useCartHydrated();
  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const busy = useCartBusy();
  const loading = useCartLoading();
  const error = useCartError();
  const hasBlockingIssues = useCartHasBlockingIssues();
  const lastMutation = useCartLastMutation();
  const { increment, decrement, remove, refresh } = useCartActions();
  const mutationMessage =
    lastMutation && lastMutation.status !== "added"
      ? locale === "vi"
        ? lastMutation.message
        : lastMutation.issue
          ? t.cartIssueLabels[lastMutation.issue]
          : t.cartMutationAdjusted
      : null;

  if (!hydrated || (loading && lines.length === 0)) {
    return <CartSkeleton />;
  }

  if (lines.length === 0) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center border border-line px-5 py-16 text-center md:py-20">
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-mist text-ink-muted">
          <CartIcon className="size-6" />
        </span>
        <h2 className="mb-2 text-xl font-black md:text-2xl">
          {error ? t.cartLoadError : t.cartPageEmptyTitle}
        </h2>
        <p className="mb-7 max-w-md text-[13.5px] leading-6 text-ink-muted">
          {error ?? t.cartPageEmptyDesc}
        </p>
        {error ? (
          <Button type="button" onClick={() => void refresh()}>
            {t.cartRetry}
          </Button>
        ) : (
          <Link href={`/${locale}/products`} className={buttonVariants({ size: "md" })}>
            {t.cartPageViewProducts}
          </Link>
        )}
      </section>
    );
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:gap-14">
      <section aria-labelledby="checkout-items-title" className="min-w-0">
        {error || mutationMessage ? (
          <p
            role={error ? "alert" : "status"}
            className="mb-4 border-l-2 border-[#D39A24] bg-[#FFF8E8] px-3.5 py-3 text-[12.5px] leading-5"
          >
            {error ?? mutationMessage}
          </p>
        ) : null}
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="checkout-items-title" className="text-lg font-black md:text-xl">
            {t.checkoutItemsTitle}
          </h2>
          <span className="text-[12.5px] text-ink-muted">
            {count} {t.cartItemsUnit}
          </span>
        </div>

        <ul className="border-t border-line">
          {lines.map((line) => (
            <li
              key={line.id}
              className="grid grid-cols-[76px_minmax(0,1fr)_auto] gap-x-3 gap-y-3 border-b border-line py-4 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-x-5 sm:py-5 md:grid-cols-[112px_minmax(0,1fr)_120px_116px_36px] md:items-center"
            >
              <Link
                href={`/${locale}/products/${line.slug}`}
                className="relative row-span-2 aspect-square overflow-hidden border border-line-soft bg-white sm:row-span-1"
              >
                <Image
                  src={line.image ?? "/logo-d-tech.png"}
                  alt={line.productName}
                  fill
                  sizes="(max-width: 639px) 76px, 112px"
                  className="object-contain p-1.5"
                />
              </Link>

              <div className="min-w-0 self-center">
                <Link
                  href={`/${locale}/products/${line.slug}`}
                  className="line-clamp-2 text-[14px] leading-5 font-bold transition-colors hover:text-accent sm:text-[15px] sm:leading-6"
                >
                  {line.productName}
                </Link>
                <p className="mt-1 truncate text-[11.5px] text-ink-faint sm:text-xs">
                  {line.variantName} · {line.sku}
                </p>
                <p className="mt-2 text-[13px] font-bold tabular-nums md:hidden">
                  {formatPrice(line.unitPrice)}
                </p>
                {line.priceChanged && line.addedUnitPrice !== undefined ? (
                  <p className="mt-1 text-[11px] leading-4 text-[#9B6808]">
                    {t.cartPriceChanged
                      .replace("{old}", formatPrice(line.addedUnitPrice))
                      .replace("{new}", formatPrice(line.unitPrice))}
                  </p>
                ) : null}
                {!line.isAvailable ? (
                  <p className="mt-1 text-[11px] leading-4 font-semibold text-accent">
                    {line.issues
                      .filter((issue) => issue !== "price_changed")
                      .map((issue) => t.cartIssueLabels[issue])
                      .join(" · ")}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void remove(line.id)}
                aria-label={`${t.cartRemove} ${line.productName}`}
                disabled={busy}
                className="flex size-8 cursor-pointer items-center justify-center self-start text-ink-faint transition-colors hover:text-accent md:order-5 md:self-center"
              >
                <CloseIcon className="size-4" />
              </button>

              <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-2 md:col-auto md:block">
                <span className="text-[11px] font-bold text-ink-faint uppercase md:mb-2 md:block">
                  {t.checkoutQuantity}
                </span>
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  onIncrement={() => void increment(line.id)}
                  onDecrement={() => void decrement(line.id)}
                  max={99}
                  disabled={busy || !line.isAvailable}
                  labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
                />
              </div>

              <div className="col-start-3 text-right md:col-auto">
                <span className="hidden text-[11px] font-bold text-ink-faint uppercase md:mb-2 md:block">
                  {t.checkoutLineTotal}
                </span>
                <strong className="text-[14px] tabular-nums sm:text-[15px]">
                  {formatPrice(line.lineTotal)}
                </strong>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href={`/${locale}/products`}
          className="mt-5 inline-flex text-[13px] font-bold text-ink-muted transition-colors hover:text-accent"
        >
          {t.checkoutContinueShopping}
        </Link>
      </section>

      <aside className="border border-line bg-white p-5 shadow-card sm:p-6 lg:sticky lg:top-6">
        <h2 className="mb-5 text-lg font-black">{t.checkoutSummary}</h2>

        <div className="flex items-end justify-between gap-4 border-y border-line py-5">
          <span className="text-sm font-bold">{t.cartSubtotal}</span>
          <strong className="text-[24px] leading-none font-black text-accent tabular-nums">
            {formatPrice(subtotal)}
          </strong>
        </div>

        <p className="py-3 text-xs leading-5 text-ink-muted">{t.cartCheckoutPricingNote}</p>

        <div className="grid grid-cols-2 gap-2.5">
          {hasBlockingIssues ? (
            <Button type="button" size="block" disabled className="min-h-12 px-2 leading-5">
              {t.cartProceedCheckout}
            </Button>
          ) : (
            <Link
              href={`/${locale}/checkout`}
              className={cn(
                buttonVariants({ size: "block" }),
                "min-h-12 px-2 text-center leading-5",
              )}
            >
              {t.cartProceedCheckout}
            </Link>
          )}
          <a
            href={`tel:${CONTACT_PHONE}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "block" }),
              "min-h-12 px-2 text-center leading-5",
            )}
          >
            <PhoneIcon className="size-4 flex-none" />
            {t.checkoutContactOrder}
          </a>
        </div>

        {hasBlockingIssues ? (
          <p className="mt-3 text-xs leading-5 font-semibold text-accent">{t.cartBlockingIssues}</p>
        ) : null}

        <p className="mt-4 text-center text-[11.5px] leading-5 text-ink-faint">
          {t.checkoutContactHint.replace("{phone}", t.phone)}
        </p>
      </aside>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid animate-pulse gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <div className="space-y-4">
        <div className="h-6 w-44 bg-mist" />
        {[0, 1].map((item) => (
          <div key={item} className="flex gap-4 border-t border-line py-5">
            <div className="size-24 flex-none bg-mist" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-4 w-3/4 bg-mist" />
              <div className="h-3 w-1/2 bg-mist" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-72 border border-line bg-mist-soft" />
    </div>
  );
}
