"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Keeps a "full screen" block exactly one screen tall — *including* whatever is
 * stacked above it.
 *
 * `height: 100svh` on its own overflows here: the topbar and the header take
 * real layout space, so a banner below them ends up that much taller than the
 * viewport and the page starts already scrolled. This measures the distance
 * from the top of the document to the element and publishes it as
 * `--fit-offset`, which the element's own CSS subtracts from `100svh`.
 *
 * Measured once per layout rather than on scroll: the header condenses as the
 * page moves, and re-measuring then would resize the banner underneath the
 * reader mid-scroll.
 */
export function useFitToViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const collapsible = document.querySelector<HTMLElement>("[data-fit-collapsible]");
      const expandedContent = collapsible?.querySelector<HTMLElement>("[data-fit-expanded-content]");
      const collapsedHeight = collapsible?.getBoundingClientRect().height ?? 0;
      // Measure the real row, not the collapsible wrapper's `scrollHeight`:
      // the latter also includes decorative pseudo-elements below the nav.
      const expandedHeight = expandedContent?.getBoundingClientRect().height ?? collapsedHeight;

      // `top + scrollY` changes when the sticky header folds its navigation
      // row. Always add back the hidden part so a resize/HMR while condensed
      // cannot make the hero taller after the header expands again.
      const hiddenHeight = Math.max(0, expandedHeight - collapsedHeight);
      const offset = element.getBoundingClientRect().top + window.scrollY + hiddenHeight;
      element.style.setProperty("--fit-offset", `${Math.max(0, Math.round(offset))}px`);
    };

    measure();
    window.addEventListener("resize", measure);
    // Web fonts land after first paint and change the header's height with
    // them, which would otherwise leave the first measurement a few px off.
    document.fonts?.ready.then(measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  return ref;
}
