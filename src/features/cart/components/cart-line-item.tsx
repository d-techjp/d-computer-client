"use client";

import Image from "next/image";
import { forwardRef } from "react";

import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

import type { CartItem, CartMutationResult } from "../api/cart.schema";
import { useCartActions, useCartBusy } from "../store/cart.store";

type CartLineItemProps = {
  line: CartItem;
  /** Briefly marks the line that the last add-to-cart touched. */
  highlighted?: boolean;
};

/**
 * One cart row with its quantity controls — shared by the mobile sheet and the
 * desktop drawer so the two never drift apart on price-change or stock notes.
 */
export const CartLineItem = forwardRef<HTMLLIElement, CartLineItemProps>(function CartLineItem(
  { line, highlighted = false },
  ref,
) {
  const { t } = useI18n();
  const busy = useCartBusy();
  const { increment, decrement, remove } = useCartActions();
  const showToast = useUiStore((state) => state.showToast);

  const notifyQuantityMutation = async (mutate: () => Promise<CartMutationResult | null>) => {
    const mutation = await mutate();
    if (!mutation) {
      showToast(t.cartQuantityUpdateFailed, "error");
      return;
    }
    if (mutation.result.status === "added") return;

    const message = mutation.result.issue
      ? t.cartIssueLabels[mutation.result.issue]
      : t.cartMutationAdjusted;
    showToast(message, mutation.result.status === "rejected" ? "error" : "warning");
  };

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-3 border-b border-mist px-5 py-3.5 transition-colors duration-700",
        highlighted && "bg-[#FFF8E8]",
      )}
    >
      <span className="relative size-[54px] flex-none overflow-hidden rounded-[10px] bg-mist">
        <Image
          src={line.image ?? "/logo-d-tech.png"}
          alt=""
          fill
          sizes="54px"
          className="object-contain"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="mb-1 block truncate text-[13px] font-semibold">{line.productName}</span>
        <span className="mb-1 block truncate text-[11.5px] text-ink-faint">
          {line.variantName} · {line.sku}
        </span>
        <span className="block text-[13px] font-bold text-accent">
          {formatPrice(line.lineTotal)}
        </span>
        {line.priceChanged && line.addedUnitPrice !== undefined ? (
          <span className="mt-1 block text-[10.5px] leading-4 text-[#9B6808]">
            {t.cartPriceChanged
              .replace("{old}", formatPrice(line.addedUnitPrice))
              .replace("{new}", formatPrice(line.unitPrice))}
          </span>
        ) : null}
        {!line.isAvailable ? (
          <span className="mt-1 block text-[10.5px] leading-4 text-accent">
            {line.issues
              .filter((issue) => issue !== "price_changed")
              .map((issue) => t.cartIssueLabels[issue])
              .join(" · ")}
          </span>
        ) : null}
      </span>

      <span className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={() => void remove(line.id)}
          aria-label={`${t.cartRemove} ${line.productName}`}
          disabled={busy}
          className="cursor-pointer text-[11.5px] text-ink-faint transition-colors hover:text-accent"
        >
          ✕
        </button>
        <QuantityStepper
          size="sm"
          value={line.quantity}
          onIncrement={() => void notifyQuantityMutation(() => increment(line.id))}
          onDecrement={() => void notifyQuantityMutation(() => decrement(line.id))}
          max={99}
          disabled={busy || !line.isAvailable}
          labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
        />
      </span>
    </li>
  );
});
