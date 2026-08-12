"use client";

import { useSyncExternalStore } from "react";

/**
 * The header condenses past `CONDENSE_ABOVE` and expands again below
 * `EXPAND_BELOW` — deliberately two thresholds, not one.
 *
 * Condensing shortens the content above the viewport, and the browser's scroll
 * anchoring compensates by moving `scrollY` back by the same amount to keep
 * what you were looking at still. With a single threshold that is an infinite
 * loop: condense → anchoring pulls `scrollY` below the line → expand →
 * anchoring pushes it back over → condense, until React gives up with
 * "Maximum update depth exceeded".
 *
 * The gap is intentionally much wider than the header's own collapse. This
 * leaves browser scroll anchoring room to compensate for the disappearing nav
 * row without crossing the opposite threshold.
 */
const CONDENSE_ABOVE = 240;
const EXPAND_BELOW = 40;

/**
 * Module-level rather than per-component: hysteresis depends on the previous
 * answer and only one site header renders.
 */
let condensed = false;

function subscribe(onStoreChange: () => void): () => void {
  const update = () => {
    const next = condensed ? window.scrollY >= EXPAND_BELOW : window.scrollY > CONDENSE_ABOVE;

    if (next === condensed) return;

    condensed = next;
    onStoreChange();
  };

  // `getSnapshot` must be a pure read. Updating this module value from it lets
  // React observe a different external-store value during the same render,
  // which is what caused the maximum update-depth loop.
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });

  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}

function getSnapshot(): boolean {
  return condensed;
}

/** The server has no scroll position; every page starts at the top. */
function getServerSnapshot(): boolean {
  return false;
}

/** Whether the page is scrolled far enough for the header to compact. */
export function useCondensedHeader(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
