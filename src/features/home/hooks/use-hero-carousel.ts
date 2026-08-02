"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The hero's slide-out / swap / slide-in sequence, lifted out of the component.
 *
 * The original drove this with four nested `setTimeout`s inside a class
 * component and leaked them on unmount. Here every timer is tracked and cleared,
 * and the animation is an explicit phase machine:
 *
 *   idle → out (slide off) → parked (swap image, transitions off) → in → idle
 *
 * `phase` is read straight from state — no mirror ref — because `goTo` is
 * recreated whenever the phase changes, so its closure is never stale.
 */
export type CarouselPhase = "idle" | "out" | "parked" | "in";

const SLIDE_OUT_MS = 560;
const PARK_MS = 60;
const SLIDE_IN_MS = 700;
const AUTOPLAY_MS = 5000;

export function useHeroCarousel(length: number) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<CarouselPhase>("idle");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const goTo = useCallback(
    (next: number) => {
      // Ignore input mid-transition; overlapping sequences would fight over the
      // phase and strand the slide off-stage.
      if (next === index || phase !== "idle") return;

      setPhase("out");
      schedule(() => {
        setIndex(next);
        setPhase("parked");
        schedule(() => setPhase("in"), PARK_MS);
        schedule(() => setPhase("idle"), SLIDE_IN_MS);
      }, SLIDE_OUT_MS);
    },
    [index, phase, schedule],
  );

  // Autoplay re-arms itself after each settled slide rather than running a
  // free-standing interval that has to be told to skip busy ticks.
  useEffect(() => {
    if (phase !== "idle") return;

    const timer = setTimeout(() => goTo((index + 1) % length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [goTo, index, length, phase]);

  // Every pending timeout dies with the component — no setState after unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
    };
  }, []);

  return { index, phase, goTo };
}
