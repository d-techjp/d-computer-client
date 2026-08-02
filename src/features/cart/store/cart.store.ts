"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { Locale } from "@/i18n/config";
import type { Product } from "@/features/products/types";

/**
 * A cart line snapshots the price *at the moment of adding*, per storefront —
 * standard e-commerce practice, and it also means a rehydrated cart renders
 * without waiting on a catalogue fetch.
 */
export type CartLine = {
  slug: string;
  name: string;
  image: string;
  unitPrice: Record<Locale, number>;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
};

type CartActions = {
  add: (product: Product, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  increment: (slug: string) => void;
  decrement: (slug: string) => void;
  clear: () => void;
};

export type CartStore = CartState & CartActions;

const INITIAL_LINES: CartLine[] = [
  {
    slug: "d-game-premium",
    name: "D-Game Premium",
    image: "/images/pc1.png",
    unitPrice: { vi: 24_900_000, ja: 249_800 },
    quantity: 1,
  },
  {
    slug: "d-mini-compact",
    name: "D-Mini Compact",
    image: "/images/pc1.png",
    unitPrice: { vi: 8_900_000, ja: 89_800 },
    quantity: 1,
  },
];

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: INITIAL_LINES,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.slug === product.slug);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.slug === product.slug
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                slug: product.slug,
                name: product.name,
                image: product.image,
                unitPrice: { ...product.priceBook },
                quantity,
              },
            ],
          };
        }),

      remove: (slug) =>
        set((state) => ({ lines: state.lines.filter((line) => line.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.max(1, quantity) } : line,
          ),
        })),

      increment: (slug) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.slug === slug ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        })),

      decrement: (slug) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.slug === slug
              ? { ...line, quantity: Math.max(1, line.quantity - 1) }
              : line,
          ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "d-computer-client.cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Actions are recreated on every load; only data belongs in storage.
      partialize: (state) => ({ lines: state.lines }),
      // The server has no localStorage, so SSR always renders INITIAL_LINES.
      // Hydrating manually (see `useCartHydrated`) lets the first client paint
      // match the server markup, then swap in the stored cart.
      skipHydration: true,
    },
  ),
);

/* ---------------------------------------------------------------------------
 * Selector hooks.
 * Subscribing to the whole store re-renders every consumer on any change.
 * Each hook below subscribes to the narrowest slice it needs, so the cart badge
 * does not re-render when a quantity stepper moves.
 * ------------------------------------------------------------------------ */

export const useCartLines = () => useCartStore(useShallow((state) => state.lines));

export const useCartCount = () =>
  useCartStore((state) => state.lines.reduce((total, line) => total + line.quantity, 0));

export const useCartSubtotal = (locale: Locale) =>
  useCartStore((state) =>
    state.lines.reduce((total, line) => total + line.unitPrice[locale] * line.quantity, 0),
  );

/** Actions are stable across renders, so this never causes a re-render. */
export const useCartActions = () =>
  useCartStore(
    useShallow((state) => ({
      add: state.add,
      remove: state.remove,
      setQuantity: state.setQuantity,
      increment: state.increment,
      decrement: state.decrement,
      clear: state.clear,
    })),
  );
