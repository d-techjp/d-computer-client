"use client";

import Image from "next/image";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CartIcon, CloseIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";

import {
  useCartActions,
  useCartCount,
  useCartLines,
  useCartSubtotal,
} from "../store/cart.store";
import { useCartHydrated } from "../store/use-cart-hydrated";

/**
 * Cart trigger + panel. The client boundary stops here — the header around it
 * stays a Server Component.
 *
 * One element, two layouts: below `lg` it is a bottom sheet (backdrop, slides
 * up, its own close button, scroll lock) because a corner dropdown sized for a
 * mouse pointer left page content visible around its edges with no obvious way
 * to dismiss it by touch. At `lg` and above it reverts to the original anchored
 * dropdown, which already worked fine with a pointer.
 */
export function CartMenu() {
  const { t } = useI18n();
  const hydrated = useCartHydrated();

  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const { increment, decrement, remove } = useCartActions();

  const open = useIsPanelOpen("cart");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  // The sheet covers the viewport on mobile — letting the page scroll behind
  // it is the classic bug where dismissing it leaves you somewhere else. A
  // no-op above `lg`, where the panel is a small anchored dropdown instead.
  useEffect(() => {
    if (!open || window.innerWidth >= 1024) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/* A sibling of the ref'd wrapper below, not a child of it: the trigger
          button must stay *inside* useDismissable's ref so its own click never
          registers as an outside click, but the backdrop must stay *outside*
          it so tapping the backdrop does dismiss the sheet. */}
      {open ? (
        <div className="fixed inset-0 z-60 bg-ink-strong/40 lg:hidden" aria-hidden />
      ) : null}

      {/* `max-lg:contents` rather than `max-lg:hidden`: below `lg` the trigger
          lives in the bottom bar instead, but this wrapper still has to render
          the panel. A hidden ancestor would take the panel down with it, and
          removing the wrapper's box entirely also stops it from leaving a gap
          in the header's icon row. `relative` only matters at `lg`, where the
          panel is an anchored dropdown. */}
      <div className="relative max-lg:contents" ref={ref}>
        <button
          type="button"
          onClick={() => toggle("cart")}
          aria-expanded={open}
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

        {open ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.cartTitle}
            className="animate-slide-up fixed inset-x-0 bottom-0 z-70 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border-t border-line-soft bg-white shadow-pop lg:animate-fade-in-up lg:absolute lg:inset-auto lg:top-[calc(100%+14px)] lg:-right-2 lg:bottom-auto lg:z-60 lg:max-h-none lg:w-85 lg:rounded-2xl lg:border lg:border-line-soft"
          >
            <span
              aria-hidden
              className="mx-auto mt-2.5 h-1 w-9 flex-none rounded-full bg-line-strong lg:hidden"
            />

            <header className="flex flex-none items-center justify-between gap-3 border-b border-line-faint px-5 pt-3 pb-3.5 lg:pt-[18px]">
              <span className="flex items-center gap-2.5">
                <span className="text-[15px] font-extrabold">{t.cartTitle}</span>
                <span className="rounded-full bg-mist px-2.5 py-[3px] text-xs text-ink-subtle">
                  {count} {t.cartItemsUnit}
                </span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={t.filterClose}
                className="cursor-pointer text-ink-muted transition-colors hover:text-accent lg:hidden"
              >
                <CloseIcon />
              </button>
            </header>

            {lines.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-ink-subtle">{t.cartEmpty}</p>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto lg:max-h-[310px] lg:flex-none">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-center gap-3 border-b border-mist px-5 py-3.5"
                    >
                      <span className="relative size-[54px] flex-none overflow-hidden rounded-[10px] bg-mist">
                        <Image src={line.image} alt="" fill sizes="54px" className="object-contain" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="mb-1 block truncate text-[13px] font-semibold">
                          {line.name}
                        </span>
                        <span className="mb-1 block truncate text-[11.5px] text-ink-faint">
                          {line.variantName} · {line.sku}
                        </span>
                        <span className="block text-[13px] font-bold text-accent">
                          {formatPrice(line.unitPrice * line.quantity)}
                        </span>
                      </span>

                      <span className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => remove(line.id)}
                          aria-label={`${t.cartRemove} ${line.name}`}
                          className="cursor-pointer text-[11.5px] text-ink-faint transition-colors hover:text-accent"
                        >
                          ✕
                        </button>
                        <QuantityStepper
                          size="sm"
                          value={line.quantity}
                          onIncrement={() => increment(line.id)}
                          onDecrement={() => decrement(line.id)}
                          labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>

                <footer className="flex-none border-t border-line-faint px-5 py-4 lg:border-t-0 lg:py-[18px]">
                  <div className="mb-3.5 flex justify-between text-[13.5px]">
                    <span className="text-ink-subtle">{t.cartSubtotal}</span>
                    <span className="text-[17px] font-extrabold tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Button size="block">{t.cartCheckout}</Button>
                </footer>
              </>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
