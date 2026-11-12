"use client";

import { create } from "zustand";

/**
 * Ephemeral overlay state, deliberately a *separate* store from the cart.
 *
 * The cart is persisted domain data; which panel happens to be open is
 * throwaway view state. Keeping them apart means the cart's storage payload
 * never carries UI junk, and opening a dropdown does not touch the persisted
 * store at all.
 *
 * `openPanel` is a single value rather than one boolean per panel, which makes
 * "only one overlay at a time" impossible to get wrong.
 */
export type Panel = "cart" | "language" | "search" | "nav" | null;

type Toast = { id: number; message: string; tone: "success" | "warning" | "error" } | null;

/**
 * What the desktop cart drawer announces at its top after an add-to-cart.
 * `pending` lets the drawer open on the click itself instead of waiting for
 * the network, so the button never feels unresponsive.
 */
export type CartNotice = {
  id: number;
  variantId: string | null;
  productName: string;
  status: "pending" | "added" | "adjusted" | "rejected" | "failed";
  message: string | null;
} | null;

type UiStore = {
  openPanel: Panel;
  toast: Toast;
  cartNotice: CartNotice;
  toggle: (panel: Exclude<Panel, null>) => void;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
  showToast: (message: string, tone?: Exclude<Toast, null>["tone"]) => void;
  dismissToast: () => void;
  setCartNotice: (notice: CartNotice) => void;
};

export const useUiStore = create<UiStore>()((set) => ({
  openPanel: null,
  toast: null,
  cartNotice: null,
  toggle: (panel) =>
    set((state) => ({ openPanel: state.openPanel === panel ? null : panel, cartNotice: null })),
  open: (panel) => set({ openPanel: panel }),
  // Closing any panel also retires the add-to-cart notice: reopening the cart
  // from the header later should show the cart, not a stale "added" banner.
  close: () => set({ openPanel: null, cartNotice: null }),
  showToast: (message, tone = "success") => set({ toast: { id: Date.now(), message, tone } }),
  dismissToast: () => set({ toast: null }),
  setCartNotice: (cartNotice) => set({ cartNotice }),
}));

export const useIsPanelOpen = (panel: Exclude<Panel, null>) =>
  useUiStore((state) => state.openPanel === panel);
