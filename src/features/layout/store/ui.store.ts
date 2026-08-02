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
export type Panel = "cart" | "language" | "search" | null;

type UiStore = {
  openPanel: Panel;
  toggle: (panel: Exclude<Panel, null>) => void;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
};

export const useUiStore = create<UiStore>()((set) => ({
  openPanel: null,
  toggle: (panel) => set((state) => ({ openPanel: state.openPanel === panel ? null : panel })),
  open: (panel) => set({ openPanel: panel }),
  close: () => set({ openPanel: null }),
}));

export const useIsPanelOpen = (panel: Exclude<Panel, null>) =>
  useUiStore((state) => state.openPanel === panel);
