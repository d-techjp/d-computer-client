"use client";

import { useCallback } from "react";

import { useUiStore } from "@/features/layout/store/ui.store";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useI18n } from "@/i18n/i18n-provider";

import type { CartMutationResult } from "../api/cart.schema";

type AddMutation = () => Promise<CartMutationResult | null>;

/**
 * One feedback policy for every add-to-cart button.
 *
 * Desktop opens the cart drawer on the click itself (in a `pending` state) and
 * fills in the outcome when the request settles, so the shopper sees where the
 * item went and can check out without hunting for the header icon. Mobile keeps
 * the existing toast — a full-height drawer there would hide the product page
 * the shopper is still deciding on.
 */
export function useAddToCartFeedback() {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();
  const showToast = useUiStore((state) => state.showToast);
  const open = useUiStore((state) => state.open);
  const setCartNotice = useUiStore((state) => state.setCartNotice);

  return useCallback(
    async (productName: string, variantId: string | null, mutate: AddMutation) => {
      const id = Date.now();
      if (isDesktop) {
        open("cart");
        setCartNotice({ id, variantId, productName, status: "pending", message: null });
      } else {
        showToast(t.cartAddedToast.replace("{product}", productName));
      }

      const mutation = await mutate();
      const result = mutation?.result;
      const message = !result
        ? t.cartAddFailed
        : result.status === "added"
          ? null
          : result.issue
            ? t.cartIssueLabels[result.issue]
            : t.cartMutationAdjusted;

      if (isDesktop) {
        // A newer click may have replaced this notice, or the shopper may have
        // closed the drawer already — never resurrect either.
        const current = useUiStore.getState().cartNotice;
        if (current?.id !== id) return;
        setCartNotice({
          ...current,
          variantId: result?.variantId ?? variantId,
          status: result ? result.status : "failed",
          message,
        });
        return;
      }

      if (message) showToast(message, result?.status === "adjusted" ? "warning" : "error");
    },
    [isDesktop, open, setCartNotice, showToast, t],
  );
}
