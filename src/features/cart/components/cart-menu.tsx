"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { LOCALE_CURRENCY } from "@/i18n/config";
import { formatPrice } from "@/lib/format/currency";

import {
  useCartActions,
  useCartCount,
  useCartLines,
  useCartSubtotal,
} from "../store/cart.store";
import { useCartHydrated } from "../store/use-cart-hydrated";

/**
 * Cart trigger + dropdown. The client boundary stops here — the header around
 * it stays a Server Component.
 */
export function CartMenu() {
  const { locale, t } = useI18n();
  const hydrated = useCartHydrated();

  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal(locale);
  const { increment, decrement, remove } = useCartActions();

  const open = useIsPanelOpen("cart");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  const currency = LOCALE_CURRENCY[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => toggle("cart")}
        aria-expanded={open}
        aria-label={t.cartTitle}
        className="relative cursor-pointer"
      >
        <CartIcon />
        {/* Suppressed until rehydration: the server cannot know the stored
            count, so rendering it on the first paint would flash the wrong
            number and warn about a mismatch. */}
        <span
          className="absolute -top-2 -right-[9px] flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white tabular-nums"
          suppressHydrationWarning
        >
          {hydrated ? count : ""}
        </span>
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+14px)] -right-2 z-60 w-[340px] animate-fade-in-up overflow-hidden rounded-2xl border border-line-soft bg-white shadow-pop">
          <header className="flex items-center justify-between border-b border-line-faint px-5 pt-[18px] pb-3.5">
            <span className="text-[15px] font-extrabold">{t.cartTitle}</span>
            <span className="rounded-full bg-mist px-2.5 py-[3px] text-xs text-ink-subtle">
              {count} {t.cartItemsUnit}
            </span>
          </header>

          {lines.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-ink-subtle">{t.cartEmpty}</p>
          ) : (
            <>
              <ul className="max-h-[310px] overflow-y-auto">
                {lines.map((line) => (
                  <li
                    key={line.slug}
                    className="flex items-center gap-3 border-b border-mist px-5 py-3.5"
                  >
                    <span className="relative size-[54px] flex-none overflow-hidden rounded-[10px] bg-mist">
                      <Image src={line.image} alt="" fill sizes="54px" className="object-contain" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block truncate text-[13px] font-semibold">
                        {line.name}
                      </span>
                      <span className="block text-[13px] font-bold text-accent">
                        {formatPrice(line.unitPrice[locale] * line.quantity, currency)}
                      </span>
                    </span>

                    <span className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`${t.cartRemove} ${line.name}`}
                        className="cursor-pointer text-[11.5px] text-ink-faint transition-colors hover:text-accent"
                      >
                        ✕
                      </button>
                      <QuantityStepper
                        size="sm"
                        value={line.quantity}
                        onIncrement={() => increment(line.slug)}
                        onDecrement={() => decrement(line.slug)}
                        labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
                      />
                    </span>
                  </li>
                ))}
              </ul>

              <footer className="px-5 py-[18px]">
                <div className="mb-3.5 flex justify-between text-[13.5px]">
                  <span className="text-ink-subtle">{t.cartSubtotal}</span>
                  <span className="text-[17px] font-extrabold tabular-nums">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <Button size="block">{t.cartCheckout}</Button>
              </footer>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
