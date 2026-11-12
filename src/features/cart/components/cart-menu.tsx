"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { CartIcon, CloseIcon } from "@/components/ui/icons";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";

import { useCartCount, useCartLines, useCartLoading, useCartSubtotal } from "../store/cart.store";
import { useCartHydrated } from "../store/use-cart-hydrated";
import { CartDrawer } from "./cart-drawer";
import { CartLineItem } from "./cart-line-item";

/**
 * Cart trigger + panel. The client boundary stops here — the header around it
 * stays a Server Component.
 *
 * Below `lg` the panel is a bottom sheet (backdrop, slides up, its own close
 * button, scroll lock): a corner dropdown sized for a mouse pointer left page
 * content visible around its edges with no obvious way to dismiss it by touch.
 * At `lg` and above it is a right-hand drawer that also opens on add-to-cart,
 * so the shopper sees the item land and can go straight to checkout.
 */
export function CartMenu() {
  const { t } = useI18n();
  const hydrated = useCartHydrated();
  const isDesktop = useIsDesktop();
  const count = useCartCount();

  const open = useIsPanelOpen("cart");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);
  // The drawer manages its own dismissal (backdrop, Escape); this hook is only
  // for the mobile sheet, where the trigger must count as "inside".
  const ref = useDismissable<HTMLDivElement>(open && !isDesktop, close);

  return (
    <>
      {/* A sibling of the ref'd wrapper below, not a child of it: the trigger
          button must stay *inside* useDismissable's ref so its own click never
          registers as an outside click, but the backdrop must stay *outside*
          it so tapping the backdrop does dismiss the sheet. */}
      {open && !isDesktop ? (
        <div className="fixed inset-0 z-60 bg-ink-strong/40" aria-hidden />
      ) : null}

      {/* `max-lg:contents` rather than `max-lg:hidden`: below `lg` the trigger
          lives in the bottom bar instead, but this wrapper still has to render
          the sheet. A hidden ancestor would take the sheet down with it. */}
      <div className="relative max-lg:contents" ref={ref}>
        <button
          type="button"
          onClick={() => toggle("cart")}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t.cartTitle}
          className="site-header__utility-action relative cursor-pointer max-lg:hidden"
        >
          <CartIcon />
          {/* Suppressed until rehydration: the server cannot know the stored
              count, so rendering it on the first paint would flash the wrong
              number and warn about a mismatch. */}
          <span
            className="absolute -top-2 -right-2.25 flex size-4 items-center justify-center rounded-full bg-[#C98B14] text-[10px] font-bold text-white tabular-nums"
            suppressHydrationWarning
          >
            {hydrated ? count : ""}
          </span>
        </button>

        {open ? isDesktop ? <CartDrawer /> : <CartSheet onClose={close} /> : null}
      </div>
    </>
  );
}

/** The mobile bottom sheet — unchanged in behaviour from before the drawer existed. */
function CartSheet({ onClose }: { onClose: () => void }) {
  const { locale, t } = useI18n();
  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const loading = useCartLoading();

  // The sheet covers the viewport — letting the page scroll behind it is the
  // classic bug where dismissing it leaves you somewhere else.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.cartTitle}
      className="animate-slide-up fixed inset-x-0 bottom-0 z-70 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border-t border-line-soft bg-white shadow-pop"
    >
      <span aria-hidden className="mx-auto mt-2.5 h-1 w-9 flex-none rounded-full bg-line-strong" />

      <header className="flex flex-none items-center justify-between gap-3 border-b border-line-faint px-5 pt-3 pb-3.5">
        <span className="flex items-center gap-2.5">
          <span className="text-[15px] font-extrabold">{t.cartTitle}</span>
          <span className="rounded-full bg-mist px-2.5 py-[3px] text-xs text-ink-subtle">
            {count} {t.cartItemsUnit}
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.filterClose}
          className="cursor-pointer text-ink-muted transition-colors hover:text-accent"
        >
          <CloseIcon />
        </button>
      </header>

      {loading && lines.length === 0 ? (
        <p className="px-5 py-10 text-center text-[13px] text-ink-subtle">{t.cartLoading}</p>
      ) : lines.length === 0 ? (
        <p className="px-5 py-10 text-center text-[13px] text-ink-subtle">{t.cartEmpty}</p>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>

          <footer className="flex-none border-t border-line-faint px-5 py-4">
            <div className="mb-3.5 flex justify-between text-[13.5px]">
              <span className="text-ink-subtle">{t.cartSubtotal}</span>
              <span className="text-[17px] font-extrabold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href={`/${locale}/cart`}
              onClick={onClose}
              className={buttonVariants({ size: "block" })}
            >
              {t.cartCheckout}
            </Link>
          </footer>
        </>
      )}
    </div>
  );
}
