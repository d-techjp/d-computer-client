"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCartActions, useCartBusy } from "@/features/cart/store/cart.store";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";

import type { Product } from "../types";

/**
 * The only interactive island on the product page — quantity plus the add
 * button. Everything else on that page (gallery, price, spec table shell,
 * description) renders on the server.
 */
export function AddToCart({ product, disabled = false }: { product: Product; disabled?: boolean }) {
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1);

  const { add } = useCartActions();
  const cartBusy = useCartBusy();
  const showToast = useUiStore((state) => state.showToast);

  const handleAdd = () => {
    showToast(t.cartAddedToast.replace("{product}", product.name));
    void add(product, quantity);
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <QuantityStepper
        value={quantity}
        onIncrement={() => setQuantity((value) => value + 1)}
        onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
        max={99}
        disabled={cartBusy}
        labels={{ increase: t.cartIncrease, decrease: t.cartDecrease }}
      />
      <Button onClick={handleAdd} disabled={disabled || cartBusy} className="flex-1">
        {disabled ? t.badgeOutOfStock : t.detailAddToCart}
      </Button>
    </div>
  );
}
