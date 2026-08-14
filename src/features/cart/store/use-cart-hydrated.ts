"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useCartStore } from "./cart.store";

/**
 * Solves the classic `persist` + SSR hydration mismatch.
 *
 * The server renders the store's initial state (it has no `localStorage`). If
 * the client rehydrated from storage *before* React's hydration pass, the first
 * client render would disagree with the server HTML and React would discard the
 * tree. So the store sets `skipHydration: true` and rehydration is kicked off
 * from an effect — after hydration is safely done.
 *
 * The flag itself comes from `useSyncExternalStore` rather than `useState` +
 * `useEffect`: it is genuinely external state (zustand's persist status), and
 * the explicit server snapshot of `false` is what guarantees the server and the
 * first client render agree.
 */
const subscribe = (onStoreChange: () => void) =>
  useCartStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useCartStore.persist.hasHydrated();
const getServerSnapshot = () => false;

export function useCartHydrated(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (hydrated && useCartStore.getState().cartId) {
      void useCartStore.getState().refresh();
    }
  }, [hydrated]);

  return hydrated;
}
