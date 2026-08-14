"use client";

import Image from "next/image";

import { ChevronDownIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/i18n-provider";

import { useFitToViewport } from "../hooks/use-fit-to-viewport";

const PARTICLES = [
  { left: "13%", bottom: "12%", size: 3, duration: "5.3s", delay: "-1.8s" },
  { left: "26%", bottom: "18%", size: 2, duration: "6.2s", delay: "-3.1s" },
  { left: "39%", bottom: "9%", size: 3, duration: "4.4s", delay: "-0.6s" },
  { left: "51%", bottom: "25%", size: 2, duration: "5.9s", delay: "-4s" },
  { left: "62%", bottom: "14%", size: 3, duration: "4.8s", delay: "-2.4s" },
  { left: "72%", bottom: "30%", size: 2, duration: "6.4s", delay: "-1.2s" },
  { left: "83%", bottom: "13%", size: 2, duration: "5.1s", delay: "-3.7s" },
  { left: "91%", bottom: "23%", size: 3, duration: "6.8s", delay: "-5.2s" },
  { left: "33%", bottom: "36%", size: 2, duration: "5.6s", delay: "-2.9s" },
  { left: "58%", bottom: "42%", size: 2, duration: "7.1s", delay: "-4.4s" },
  { left: "76%", bottom: "48%", size: 2, duration: "5.7s", delay: "-1.1s" },
  { left: "18%", bottom: "45%", size: 2, duration: "6.5s", delay: "-3.4s" },
];

const SPARKS = [
  { left: "54%", top: "30%", duration: "2.1s", delay: "-1.4s" },
  { left: "76%", top: "50%", duration: "3.4s", delay: "-2.6s" },
  { left: "63%", top: "73%", duration: "2.7s", delay: "-0.8s" },
  { left: "87%", top: "28%", duration: "4.1s", delay: "-3.5s" },
];

/**
 * A CSS-animated gaming product scene sized to exactly one screen — the header
 * stack above it included, see `useFitToViewport`.
 *
 * Two arrangements, not one scaled: side by side above `lg`, and stacked below
 * it — copy in the upper band, the machine in the lower one. Overlapping the
 * two on a phone leaves the headline sitting on top of the case.
 */
export function Hero() {
  const { t } = useI18n();
  const ref = useFitToViewport<HTMLElement>();

  /**
   * The banner fills the screen, so there is nothing below it to hint at. The
   * arrow is that hint: it lands the reader on the first product carousel.
   */
  const scrollToCarousel = () => {
    const target = document.querySelector<HTMLElement>("[data-home-carousel]");
    const header = document.querySelector("header");
    if (!target || !header) return;

    // Layout position rather than `getBoundingClientRect()`: the section has
    // not been revealed yet and is still holding the `.reveal` offset, which
    // the rect would include and the finished scroll would not.
    let top = 0;
    for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null) {
      top += node.offsetTop;
    }

    // Two allowances for the sticky header. Its nav row folds away on the way
    // down, lifting everything below it by that much, and its top row is still
    // covering the landing spot once the page settles. The nav row is display:
    // none below `lg`, where it measures 0 and drops out of the sum by itself.
    const [topRow, navRow] = header.children;
    const covered = topRow.getBoundingClientRect().height;
    const folding = navRow === topRow ? 0 : navRow.getBoundingClientRect().height;

    window.scrollTo({ top: top - folding - covered - 8, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      // Below `lg` the cart bar is fixed over the bottom of the screen. The
      // banner still fills the viewport, but its contents stop above the bar
      // rather than being covered by it — same run-off the footer gets.
      className="gaming-hero relative flex w-full flex-col overflow-hidden border-b border-black max-lg:pb-[calc(4.25rem+env(safe-area-inset-bottom))]"
    >
      <div className="gaming-hero__ambient" aria-hidden />
      <span className="gaming-hero__beam gaming-hero__beam--one" aria-hidden />
      <span className="gaming-hero__beam gaming-hero__beam--two" aria-hidden />
      <span className="gaming-hero__floor" aria-hidden />
      <div className="gaming-hero__frame" aria-hidden>
        <span className="gaming-hero__corner gaming-hero__corner--tl" />
        <span className="gaming-hero__corner gaming-hero__corner--tr" />
        <span className="gaming-hero__corner gaming-hero__corner--bl" />
        <span className="gaming-hero__corner gaming-hero__corner--br" />
      </div>
      <div className="gaming-hero__rails" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="gaming-hero__telemetry" aria-hidden>
        <span>D-TECH // GAMING SYSTEM</span>
        <span>PERFORMANCE CORE ONLINE</span>
        <i />
        <i />
        <i />
      </div>
      <div className="gaming-hero__target" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <span className="gaming-hero__scan" aria-hidden />
      <span className="gaming-hero__serial" aria-hidden>
        D-COMPUTER // 2026.08
      </span>

      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        {PARTICLES.map((particle) => (
          <span
            key={`${particle.left}-${particle.delay}`}
            className="gaming-hero__particle"
            style={{
              left: particle.left,
              bottom: particle.bottom,
              width: particle.size,
              height: particle.size,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            }}
          />
        ))}
        {SPARKS.map((spark) => (
          <span
            key={`${spark.left}-${spark.delay}`}
            className="gaming-hero__spark"
            style={{
              left: spark.left,
              top: spark.top,
              animationDuration: spark.duration,
              animationDelay: spark.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 flex flex-1 items-center px-5 pt-6 pb-2 sm:px-10 md:px-[7vw]">
        <div className="max-w-[560px] lg:max-w-[44%]">
          <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-red-200 sm:text-[12px]">
            {t.heroKicker}
          </p>
          {/* Clamped rather than stepped: between the header and the machine
              below, a phone in landscape has barely 250px of band to fill. */}
          <h1 className="mb-4 text-[clamp(26px,6.6vw,40px)] leading-[1.1] font-black text-white md:mb-5 lg:text-[clamp(40px,4.4vw,66px)]">
            {t.heroTitle1}
            <br />
            {t.heroTitle2} <span className="text-red-400">{t.heroAccent}</span>
            {t.heroTitle3}
          </h1>
          <p className="max-w-[500px] text-[13.5px] leading-[1.7] text-white/70 md:text-base">
            {t.heroDesc}
          </p>
        </div>
      </div>

      {/* A flow item below `lg` so the copy above it keeps a band of its own,
          and an overlay above `lg`, where the copy only claims the left half. */}
      <div
        className="relative z-10 h-[34%] shrink-0 md:h-[44%] lg:absolute lg:right-[2%] lg:bottom-[-1%] lg:h-[90%] lg:w-[58%] lg:max-w-[840px]"
        aria-hidden
      >
        {/* Set dressing for the case, and the first thing to go on a phone:
            at that width they read as clutter behind the real product. */}
        <div className="gaming-monitor max-lg:hidden">
          <div className="gaming-monitor__screen">
            <span />
            <span />
            <span />
          </div>
          <span className="gaming-monitor__stand" />
        </div>
        <div className="gaming-keyboard max-lg:hidden">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="gaming-pc">
          <Image
            src="/images/pc1.png"
            alt=""
            fill
            priority
            // The rendered box, not the viewport: ~320px at its widest on a
            // phone, so the source's full 4.7MB never reaches one.
            sizes="(max-width: 1023px) 320px, (max-width: 1440px) 42vw, 605px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 lg:bottom-6">
        <button
          type="button"
          onClick={scrollToCarousel}
          aria-label={t.heroScrollDown}
          className="gaming-hero__scroll flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-red-300/70 hover:bg-red-500/25"
        >
          <ChevronDownIcon width={22} height={22} />
        </button>
      </div>
    </section>
  );
}
