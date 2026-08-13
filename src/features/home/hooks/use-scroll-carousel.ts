"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

/**
 * A carousel driven by the browser's own horizontal scrolling, rather than by
 * a JS-computed `translateX`.
 *
 * The win is that "how many cards fit" stays a pure CSS question: the track
 * is a flex row of percentage-width cards, so the count changes with the
 * breakpoint without this hook ever knowing the viewport. A transform-based
 * pager has to know the page size in JS, which is what made the previous
 * version stack three full-width cards on top of each other on a phone.
 *
 * It also means touch swipe, trackpad scroll and keyboard scrolling all work
 * for free — they are the platform's, not something re-implemented here.
 */
const AUTOPLAY_MS = 4500;

export function useScrollCarousel<T extends HTMLElement>(itemCount: number) {
  const ref = useRef<T>(null);
  // A ref, not state: pausing must not re-render the card list underneath.
  const paused = useRef(false);
  const drag = useRef({
    axis: "pending" as "horizontal" | "pending" | "vertical",
    didDrag: false,
    pointerId: -1,
    startLeft: 0,
    startX: 0,
    startY: 0,
  });

  const pause = useCallback(() => {
    paused.current = true;
  }, []);

  const resume = useCallback(() => {
    paused.current = false;
  }, []);

  const step = useCallback((direction: 1 | -1) => {
    const track = ref.current;
    const card = track?.firstElementChild;
    if (!track || !(card instanceof HTMLElement)) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const stride = card.offsetWidth + gap;
    const max = track.scrollWidth - track.clientWidth;
    const current = track.scrollLeft;

    // Advance one card and *clamp*; only wrap once already parked at an edge.
    // Wrapping on "the next step would overshoot" instead skipped the final
    // stretch of the track — with a stride of ~332px against a 634px range,
    // the second click overshot and bounced back to the start while two cards
    // were still off-screen.
    const left =
      direction === 1
        ? current >= max - 1
          ? 0
          : Math.min(current + stride, max)
        : current <= 1
          ? max
          : Math.max(current - stride, 0);

    track.scrollTo({ left, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (itemCount <= 1) return;
    // Honour the same preference the CSS reveal animations do.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      if (!paused.current) step(1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [itemCount, step]);

  const onPointerDown = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const track = ref.current;
    if (!track) return;

    pause();
    drag.current = {
      axis: "pending",
      didDrag: false,
      pointerId: event.pointerId,
      startLeft: track.scrollLeft,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [pause]);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const track = ref.current;
    const activeDrag = drag.current;
    if (!track || activeDrag.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - activeDrag.startX;
    const distanceY = event.clientY - activeDrag.startY;

    if (activeDrag.axis === "pending") {
      if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) <= 5) return;
      activeDrag.axis = Math.abs(distanceX) > Math.abs(distanceY) ? "horizontal" : "vertical";
    }
    if (activeDrag.axis === "vertical") return;

    activeDrag.didDrag = true;
    track.scrollLeft = activeDrag.startLeft - distanceX;
  }, []);

  const onPointerUp = useCallback(
    (event: PointerEvent<T>) => {
      if (drag.current.pointerId !== event.pointerId) return;

      drag.current.pointerId = -1;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      // Mouse hover should keep autoplay paused while a card is being read;
      // a touch interaction has no hover state, so resume after its drag ends.
      if (event.pointerType !== "mouse") resume();
    },
    [resume],
  );

  const onPointerCancel = useCallback(
    (event: PointerEvent<T>) => {
      if (drag.current.pointerId !== event.pointerId) return;

      drag.current.pointerId = -1;
      drag.current.didDrag = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (event.pointerType !== "mouse") resume();
    },
    [resume],
  );

  const onClickCapture = useCallback((event: MouseEvent<T>) => {
    // Browsers dispatch a click after pointer-up. Avoid opening a card when
    // the same gesture was a horizontal drag, but leave ordinary clicks alone.
    if (!drag.current.didDrag) return;

    drag.current.didDrag = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    ref,
    step,
    pause,
    resume,
    dragHandlers: { onClickCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp },
  };
}
