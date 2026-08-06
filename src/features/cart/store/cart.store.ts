"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import {
  defaultVariant,
  productImage,
  variantImages,
  type Product,
  type ProductVariant,
} from "@/features/products/types";

/**
 * A cart line snapshots the price *at the moment of adding* — standard
 * e-commerce practice, and it also means a rehydrated cart renders without
 * waiting on a catalogue fetch.
 */
export type CartLine = {
  id: string;
  slug: string;
  variantId: string;
  sku: string;
  name: string;
  variantName: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
};

type CartActions = {
  add: (product: Product, quantity?: number) => void;
  addVariant: (product: Product, variant: ProductVariant, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
};

export type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],

      add: (product, quantity = 1) =>
        set((state) => {
          const variant = defaultVariant(product);
          if (!variant) return state;
          return addCartLine(state, product, variant, quantity);
        }),

      addVariant: (product, variant, quantity = 1) =>
        set((state) => {
          return addCartLine(state, product, variant, quantity);
        }),

      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, quantity: Math.max(1, quantity) } : line,
          ),
        })),

      increment: (id) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        })),

      decrement: (id) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id
              ? { ...line, quantity: Math.max(1, line.quantity - 1) }
              : line,
          ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "d-computer-client.cart",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // Actions are recreated on every load; only data belongs in storage.
      partialize: (state) => ({ lines: state.lines }),
      // The server has no localStorage, so SSR always renders an empty cart.
      // Hydrating manually (see `useCartHydrated`) lets the first client paint
      // match the server markup, then swap in the stored cart.
      skipHydration: true,
    },
  ),
);

function addCartLine(
  state: CartState,
  product: Product,
  variant: ProductVariant,
  quantity: number,
): CartState {
  const id = `${product.slug}:${variant.id}`;
  const existing = state.lines.find((line) => line.id === id);

  if (existing) {
    return {
      lines: state.lines.map((line) =>
        line.id === id ? { ...line, quantity: line.quantity + quantity } : line,
      ),
    };
  }

  return {
    lines: [
      ...state.lines,
      {
        id,
        slug: product.slug,
        variantId: variant.id,
        sku: variant.sku,
        name: product.name,
        variantName: variant.name,
        image: variantImages(product, variant)[0] ?? productImage(product),
        unitPrice: variant.price,
        quantity,
      },
    ],
  };
}

/* ---------------------------------------------------------------------------
 * Selector hooks.
 * Subscribing to the whole store re-renders every consumer on any change.
 * Each hook below subscribes to the narrowest slice it needs, so the cart badge
 * does not re-render when a quantity stepper moves.
 * ------------------------------------------------------------------------ */

export const useCartLines = () => useCartStore(useShallow((state) => state.lines));

export const useCartCount = () =>
  useCartStore((state) => state.lines.reduce((total, line) => total + line.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0),
  );

/** Actions are stable across renders, so this never causes a re-render. */
export const useCartActions = () =>
  useCartStore(
    useShallow((state) => ({
      add: state.add,
      addVariant: state.addVariant,
      remove: state.remove,
      setQuantity: state.setQuantity,
      increment: state.increment,
      decrement: state.decrement,
      clear: state.clear,
    })),
  );
