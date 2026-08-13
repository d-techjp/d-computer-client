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
  const momentumFrame = useRef<number | null>(null);
  const drag = useRef({
    axis: "pending" as "horizontal" | "pending" | "vertical",
    didDrag: false,
    pointerId: -1,
    startLeft: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const stopMomentum = useCallback(() => {
    if (momentumFrame.current !== null) {
      cancelAnimationFrame(momentumFrame.current);
      momentumFrame.current = null;
    }
  }, []);

  const startMomentum = useCallback((initialVelocity: number) => {
    const track = ref.current;
    if (!track || Math.abs(initialVelocity) < 0.08) return;

    stopMomentum();
    let velocity = initialVelocity;
    let previousTime = performance.now();

    const tick = (time: number) => {
      const currentTrack = ref.current;
      if (!currentTrack) return;

      const elapsed = Math.min(time - previousTime, 48);
      previousTime = time;
      const maxLeft = currentTrack.scrollWidth - currentTrack.clientWidth;
      const nextLeft = Math.max(0, Math.min(currentTrack.scrollLeft + velocity * elapsed, maxLeft));

      currentTrack.scrollLeft = nextLeft;
      // Decelerate at the same rate on displays with different refresh rates.
      velocity *= Math.pow(0.92, elapsed / 16.67);

      if (nextLeft <= 0 || nextLeft >= maxLeft || Math.abs(velocity) < 0.015) {
        momentumFrame.current = null;
        return;
      }

      momentumFrame.current = requestAnimationFrame(tick);
    };

    momentumFrame.current = requestAnimationFrame(tick);
  }, [stopMomentum]);

  const pause = useCallback(() => {
    paused.current = true;
  }, []);

  const resume = useCallback(() => {
    paused.current = false;
  }, []);

  useEffect(() => stopMomentum, [stopMomentum]);

  const step = useCallback((direction: 1 | -1) => {
    stopMomentum();
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
  }, [stopMomentum]);

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

    stopMomentum();
    pause();
    drag.current = {
      axis: "pending",
      didDrag: false,
      pointerId: event.pointerId,
      startLeft: track.scrollLeft,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  }, [pause, stopMomentum]);

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

    // Capturing at pointer-down also captures an ordinary click on a product
    // link. Wait until the gesture is proven to be a horizontal drag instead.
    if (!track.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const elapsed = event.timeStamp - activeDrag.lastTime;
    if (elapsed > 0) {
      const instantaneousVelocity = -(event.clientX - activeDrag.lastX) / elapsed;
      // Smooth out noisy pointer samples while retaining a responsive flick.
      activeDrag.velocity = activeDrag.velocity * 0.7 + instantaneousVelocity * 0.3;
      activeDrag.lastX = event.clientX;
      activeDrag.lastTime = event.timeStamp;
    }
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
      if (drag.current.didDrag) startMomentum(drag.current.velocity);
      // Mouse hover should keep autoplay paused while a card is being read;
      // a touch interaction has no hover state, so resume after its drag ends.
      if (event.pointerType !== "mouse") resume();
    },
    [resume, startMomentum],
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
