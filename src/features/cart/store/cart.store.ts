"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { toApiError } from "@/lib/api/errors";
import { defaultVariant, type Product, type ProductVariant } from "@/features/products/types";

import {
  addCartItem,
  clearCart as clearRemoteCart,
  createCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart.repository";
import type { Cart, CartItem, CartMutationResult } from "../api/cart.schema";

type CartRequestStatus = "idle" | "loading" | "mutating";

type CartState = {
  /** The only cart value persisted in the browser, per cart.contract.yaml. */
  cartId: string | null;
  /** Live backend projection. Never persisted; prices and stock must stay current. */
  cart: Cart | null;
  requestStatus: CartRequestStatus;
  error: string | null;
  lastMutation: CartMutationResult["result"] | null;
  /** Quantity acknowledged locally while an add request is still in flight. */
  pendingItemCount: number;
};

type CartActions = {
  ensureCart: () => Promise<string | null>;
  refresh: () => Promise<Cart | null>;
  add: (product: Product, quantity?: number) => Promise<CartMutationResult | null>;
  addVariant: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
  ) => Promise<CartMutationResult | null>;
  setQuantity: (itemId: string, quantity: number) => Promise<CartMutationResult | null>;
  increment: (itemId: string) => Promise<CartMutationResult | null>;
  decrement: (itemId: string) => Promise<CartMutationResult | null>;
  remove: (itemId: string) => Promise<Cart | null>;
  clear: () => Promise<Cart | null>;
  discard: () => void;
  dismissMutation: () => void;
  clearError: () => void;
};

export type CartStore = CartState & CartActions;

const INITIAL_STATE: CartState = {
  cartId: null,
  cart: null,
  requestStatus: "idle",
  error: null,
  lastMutation: null,
  pendingItemCount: 0,
};

const EMPTY_ITEMS: CartItem[] = [];
let createPromise: Promise<Cart> | null = null;
let refreshPromise: Promise<Cart | null> | null = null;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      ensureCart: async () => {
        const currentId = get().cartId;
        if (currentId) return currentId;

        set({ requestStatus: "mutating", error: null });
        createPromise ??= createCart();

        try {
          const cart = await createPromise;
          set({ cartId: cart.id, cart, requestStatus: "idle" });
          return cart.id;
        } catch (cause) {
          set({ requestStatus: "idle", error: toApiError(cause).message });
          return null;
        } finally {
          createPromise = null;
        }
      },

      refresh: async () => {
        const cartId = get().cartId;
        if (!cartId) {
          set({ cart: null, requestStatus: "idle" });
          return null;
        }
        if (refreshPromise) return refreshPromise;

        set({ requestStatus: "loading", error: null });
        refreshPromise = (async () => {
          try {
            const cart = await getCart(cartId);
            if (get().cartId !== cartId) return null;
            set({ cart, requestStatus: "idle" });
            return cart;
          } catch (cause) {
            const error = toApiError(cause);
            if (error.status === 403 || error.status === 404) {
              set({ ...INITIAL_STATE });
            } else {
              set({ requestStatus: "idle", error: error.message });
            }
            return null;
          } finally {
            refreshPromise = null;
          }
        })();

        return refreshPromise;
      },

      add: async (product, quantity = 1) => {
        const variant = defaultVariant(product);
        if (!variant) return null;
        return get().addVariant(product, variant, quantity);
      },

      addVariant: async (_product, variant, quantity = 1) => {
        const requestedQuantity = Math.min(99, quantity);
        // The backend remains authoritative, but the badge should acknowledge
        // the tap immediately — especially when creating a cart takes a round trip.
        set((state) => ({
          pendingItemCount: state.pendingItemCount + requestedQuantity,
          requestStatus: "mutating",
          error: null,
          lastMutation: null,
        }));
        const cartId = await get().ensureCart();
        if (!cartId) {
          set((state) => ({ pendingItemCount: Math.max(0, state.pendingItemCount - requestedQuantity) }));
          return null;
        }

        set({ requestStatus: "mutating", error: null, lastMutation: null });

        try {
          const mutation = await addCartItem(cartId, variant.id, requestedQuantity);
          set((state) => ({
            cart: mutation.cart,
            pendingItemCount: Math.max(0, state.pendingItemCount - requestedQuantity),
            requestStatus: "idle",
            lastMutation: mutation.result,
          }));
          return mutation;
        } catch (cause) {
          set((state) => ({ pendingItemCount: Math.max(0, state.pendingItemCount - requestedQuantity) }));
          await recoverMutationFailure(cause, cartId, set);
          return null;
        }
      },

      setQuantity: async (itemId, quantity) => {
        const cartId = get().cartId;
        if (!cartId) return null;

        const previousCart = get().cart;
        const currentItem = previousCart?.items.find((item) => item.id === itemId);
        const nextQuantity = Math.max(1, Math.min(99, quantity));
        if (!previousCart || !currentItem) return null;

        const delta = nextQuantity - currentItem.quantity;
        set({
          cart: {
            ...previousCart,
            itemCount: previousCart.itemCount + delta,
            subtotal: previousCart.subtotal + currentItem.unitPrice * delta,
            items: previousCart.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: nextQuantity, lineTotal: item.unitPrice * nextQuantity }
                : item,
            ),
          },
          requestStatus: "mutating",
          error: null,
          lastMutation: null,
        });

        try {
          const mutation = await updateCartItem(
            cartId,
            itemId,
            nextQuantity,
          );
          set({ cart: mutation.cart, requestStatus: "idle", lastMutation: mutation.result });
          return mutation;
        } catch (cause) {
          set({ cart: previousCart });
          await recoverMutationFailure(cause, cartId, set);
          return null;
        }
      },

      increment: async (itemId) => {
        const item = get().cart?.items.find((candidate) => candidate.id === itemId);
        if (!item || item.quantity >= 99) return null;
        return get().setQuantity(itemId, item.quantity + 1);
      },

      decrement: async (itemId) => {
        const item = get().cart?.items.find((candidate) => candidate.id === itemId);
        if (!item || item.quantity <= 1) return null;
        return get().setQuantity(itemId, item.quantity - 1);
      },

      remove: async (itemId) => {
        const cartId = get().cartId;
        if (!cartId) return null;

        set({ requestStatus: "mutating", error: null, lastMutation: null });
        try {
          const cart = await removeCartItem(cartId, itemId);
          set({ cart, requestStatus: "idle" });
          return cart;
        } catch (cause) {
          await recoverMutationFailure(cause, cartId, set);
          return null;
        }
      },

      clear: async () => {
        const cartId = get().cartId;
        if (!cartId) return null;

        set({ requestStatus: "mutating", error: null, lastMutation: null });
        try {
          const cart = await clearRemoteCart(cartId);
          set({ cart, requestStatus: "idle" });
          return cart;
        } catch (cause) {
          await recoverMutationFailure(cause, cartId, set);
          return null;
        }
      },

      discard: () => set({ ...INITIAL_STATE }),
      dismissMutation: () => set({ lastMutation: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "d-computer-client.cart",
      storage: createJSONStorage(() => localStorage),
      version: 4,
      partialize: (state) => ({ cartId: state.cartId }),
      migrate: (persistedState, version) => {
        if (version === 4 && persistedState && typeof persistedState === "object") {
          const cartId = (persistedState as { cartId?: unknown }).cartId;
          return { cartId: typeof cartId === "string" ? cartId : null };
        }
        // Versions <=3 persisted price snapshots and lines, which the new DB
        // cart contract explicitly forbids. Start without a cart id.
        return { cartId: null };
      },
      skipHydration: true,
    },
  ),
);

async function recoverMutationFailure(
  cause: unknown,
  cartId: string,
  set: (partial: Partial<CartStore>) => void,
): Promise<void> {
  const error = toApiError(cause);

  if (error.status === 403) {
    set({ ...INITIAL_STATE, error: error.message });
    return;
  }

  if (error.status === 404) {
    try {
      // A mutation 404 may mean either the cart/item or the variant is gone.
      // Refresh distinguishes those cases without throwing away a valid cart.
      const cart = await getCart(cartId);
      set({ cart, requestStatus: "idle", error: error.message });
      return;
    } catch (refreshCause) {
      const refreshError = toApiError(refreshCause);
      if (refreshError.status === 403 || refreshError.status === 404) {
        set({ ...INITIAL_STATE, error: error.message });
        return;
      }
    }
  }

  set({ requestStatus: "idle", error: error.message });
}

export const useCart = () => useCartStore((state) => state.cart);
export const useCartId = () => useCartStore((state) => state.cartId);
export const useCartLines = () => useCartStore((state) => state.cart?.items ?? EMPTY_ITEMS);
export const useCartCount = () =>
  useCartStore((state) => (state.cart?.itemCount ?? 0) + state.pendingItemCount);
export const useCartSubtotal = () => useCartStore((state) => state.cart?.subtotal ?? 0);
export const useCartHasBlockingIssues = () =>
  useCartStore((state) => state.cart?.hasBlockingIssues ?? false);
export const useCartBusy = () => useCartStore((state) => state.requestStatus !== "idle");
export const useCartLoading = () => useCartStore((state) => state.requestStatus === "loading");
export const useCartError = () => useCartStore((state) => state.error);
export const useCartLastMutation = () => useCartStore((state) => state.lastMutation);

export const useCartActions = () =>
  useCartStore(
    useShallow((state) => ({
      ensureCart: state.ensureCart,
      refresh: state.refresh,
      add: state.add,
      addVariant: state.addVariant,
      setQuantity: state.setQuantity,
      increment: state.increment,
      decrement: state.decrement,
      remove: state.remove,
      clear: state.clear,
      discard: state.discard,
      dismissMutation: state.dismissMutation,
      clearError: state.clearError,
    })),
  );
