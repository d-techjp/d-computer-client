"use client";

import { useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint — the line where the cart switches from bottom sheet to drawer. */
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

/**
 * True at `lg` and above. The server snapshot is `false`, so the first paint
 * matches the mobile markup and a desktop client switches right after
 * hydration — overlays are closed at that point, so nothing visibly jumps.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}
