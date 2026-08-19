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

type UiStore = {
  openPanel: Panel;
  toast: Toast;
  toggle: (panel: Exclude<Panel, null>) => void;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
  showToast: (message: string, tone?: Exclude<Toast, null>["tone"]) => void;
  dismissToast: () => void;
};

export const useUiStore = create<UiStore>()((set) => ({
  openPanel: null,
  toast: null,
  toggle: (panel) => set((state) => ({ openPanel: state.openPanel === panel ? null : panel })),
  open: (panel) => set({ openPanel: panel }),
  close: () => set({ openPanel: null }),
  showToast: (message, tone = "success") => set({ toast: { id: Date.now(), message, tone } }),
  dismissToast: () => set({ toast: null }),
}));

export const useIsPanelOpen = (panel: Exclude<Panel, null>) =>
  useUiStore((state) => state.openPanel === panel);
