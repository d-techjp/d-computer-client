"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-into-view reveal.
 *
 * The original bound a `scroll` listener that called `getBoundingClientRect()`
 * on every section, on every scroll event — layout thrash on the main thread.
 * `IntersectionObserver` does the same work off the main thread, fires once for
 * anything already on screen, and disconnects after the first hit because the
 * reveal is one-way.
 *
 * Reduced-motion is handled entirely in CSS (see `.reveal` in globals.css), so
 * there is no JS branch here that could disagree with the server render.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
