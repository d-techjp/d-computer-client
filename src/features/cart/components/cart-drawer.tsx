"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import { useDrawerFocus } from "../hooks/use-drawer-focus";
import {
  useCartCount,
  useCartHasBlockingIssues,
  useCartLines,
  useCartLoading,
  useCartSubtotal,
} from "../store/cart.store";
import { CartDrawerNotice } from "./cart-drawer-notice";
import { CartLineItem } from "./cart-line-item";

/**
 * Desktop cart: a right-hand drawer that opens on add-to-cart and from the
 * header icon. Portalled to `<body>` because the sticky header creates its own
 * stacking context, which would trap a `fixed` child under page content.
 */
export function CartDrawer() {
  const { locale, t } = useI18n();
  const close = useUiStore((state) => state.close);
  const notice = useUiStore((state) => state.cartNotice);

  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const loading = useCartLoading();
  const blocked = useCartHasBlockingIssues();

  const panelRef = useDrawerFocus<HTMLElement>(close);
  const highlightRef = useRef<HTMLLIElement>(null);
  const highlightVariant = notice && notice.status !== "pending" ? notice.variantId : null;

  // Long carts would otherwise leave the just-added line below the fold.
  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightVariant]);

  return createPortal(
    <>
      <div
        className="animate-fade-in fixed inset-0 z-90 bg-ink-strong/40"
        onClick={close}
        aria-hidden
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cartTitle}
        className="animate-slide-in-right fixed inset-y-0 right-0 z-100 flex w-[420px] max-w-[92vw] flex-col bg-white shadow-pop"
      >
        <header className="flex flex-none items-center justify-between gap-3 border-b border-line-faint px-5 py-4">
          <span className="flex items-center gap-2.5">
            <span className="text-[16px] font-extrabold">{t.cartTitle}</span>
            <span className="rounded-full bg-mist px-2.5 py-[3px] text-xs text-ink-subtle tabular-nums">
              {count} {t.cartItemsUnit}
            </span>
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t.filterClose}
            data-autofocus
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-mist hover:text-accent"
          >
            <CloseIcon />
          </button>
        </header>

        {notice ? <CartDrawerNotice key={notice.id} notice={notice} /> : null}

        {loading && lines.length === 0 ? (
          <p className="flex-1 px-5 py-12 text-center text-[13px] text-ink-subtle">
            {t.cartLoading}
          </p>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-12">
            <p className="text-[13px] text-ink-subtle">{t.cartEmpty}</p>
            <button
              type="button"
              onClick={close}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t.cartContinueShopping}
            </button>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {lines.map((line) => {
                const highlighted = line.variantId === highlightVariant;
                return (
                  <CartLineItem
                    key={line.id}
                    ref={highlighted ? highlightRef : undefined}
                    line={line}
                    highlighted={highlighted}
                  />
                );
              })}
            </ul>

            <footer className="flex-none border-t border-line-faint bg-mist-soft px-5 pt-4 pb-5">
              <div className="mb-1 flex items-baseline justify-between text-[13.5px]">
                <span className="text-ink-subtle">{t.cartSubtotal}</span>
                <span className="text-[19px] font-extrabold tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mb-4 text-[11.5px] leading-5 text-ink-faint">
                {t.cartCheckoutPricingNote}
              </p>
              {/* With a blocked line the checkout page would only bounce the
                  shopper back, so send them to the cart where it can be fixed. */}
              <Link
                href={blocked ? `/${locale}/cart` : `/${locale}/checkout`}
                onClick={close}
                className={cn(buttonVariants({ size: "block" }), "mb-2.5")}
              >
                {blocked ? t.cartReviewIssues : t.cartCheckout}
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/${locale}/cart`}
                  onClick={close}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t.cartViewCart}
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  {t.cartContinueShopping}
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>,
    document.body,
  );
}
