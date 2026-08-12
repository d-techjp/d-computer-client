"use client";

import { CartIcon } from "@/components/ui/icons";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";

import { useCartCount, useCartSubtotal } from "../store/cart.store";
import { useCartHydrated } from "../store/use-cart-hydrated";

/**
 * The cart's reach on touch devices: a fixed bar on the bottom edge, where a
 * thumb already rests, instead of a small icon in the top-right corner that
 * scrolls away and needs a stretch to hit.
 *
 * It is a trigger only — `<CartMenu>` still owns the panel, and both talk to
 * the same `"cart"` entry in the UI store. Opening rather than *toggling* is
 * deliberate: the bar sits under the sheet's backdrop once open, so it can
 * never be the thing you tap to close, and a toggle would only misfire.
 */
export function CartBar() {
  const { t } = useI18n();
  const hydrated = useCartHydrated();

  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const open = useUiStore((state) => state.open);

  return (
    <button
      type="button"
      onClick={() => open("cart")}
      aria-label={t.cartTitle}
      className="fixed inset-x-0 bottom-0 z-40 flex cursor-pointer items-center gap-3 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-left shadow-[0_-6px_18px_oklch(15%_0.01_260/0.08)] backdrop-blur lg:hidden"
    >
      <span className="relative flex-none text-ink-strong">
        <CartIcon />
        {/* Suppressed until rehydration: the server cannot know the stored
            count, so a first paint would flash the wrong number and warn. */}
        <span
          className="absolute -top-2 -right-2.25 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white tabular-nums"
          suppressHydrationWarning
        >
          {hydrated ? count : ""}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold">{t.cartTitle}</span>
        <span className="block text-[11.5px] text-ink-muted" suppressHydrationWarning>
          {hydrated ? `${count} ${t.cartItemsUnit}` : ""}
        </span>
      </span>

      <span className="flex-none text-right">
        <span className="block text-[11px] text-ink-muted">{t.cartSubtotal}</span>
        <span
          className="block text-[15px] font-extrabold text-accent tabular-nums"
          suppressHydrationWarning
        >
          {hydrated ? formatPrice(subtotal) : ""}
        </span>
      </span>
    </button>
  );
}
