"use client";

import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { BlossomCluster } from "@/components/ui/icons";
import type { CategoryNode } from "@/features/catalog/tree";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { useHeroCarousel } from "../hooks/use-hero-carousel";
import { CategoryHighlights } from "./category-highlights";

const SLIDES = ["/images/pc1.png", "/images/card1.png", "/images/ram1.png"];

const PETALS = [
  { left: "4%", size: 10, duration: "9s", delay: "0s" },
  { left: "14%", size: 14, duration: "11s", delay: "2s" },
  { left: "26%", size: 9, duration: "8s", delay: "4s" },
  { left: "38%", size: 12, duration: "10s", delay: "1s" },
  { left: "50%", size: 11, duration: "12s", delay: "5s" },
  { left: "62%", size: 15, duration: "9.5s", delay: "3s" },
  { left: "74%", size: 10, duration: "10.5s", delay: "6s" },
  { left: "84%", size: 13, duration: "8.5s", delay: "2.5s" },
  { left: "92%", size: 9, duration: "11.5s", delay: "0.5s" },
  { left: "68%", size: 8, duration: "9s", delay: "7s" },
];

/**
 * The home page's main board: the rotating banner with a column of category
 * shortcuts beside it. Browsing the catalogue by category is the header menu's
 * job — these cards are the promoted handful, not the index.
 */
export function Hero({ categories }: { categories: CategoryNode[] }) {
  const { locale, t } = useI18n();
  const { index, phase, goTo } = useHeroCarousel(SLIDES.length);

  const hidden = phase === "out" || phase === "parked";

  return (
    <section className="flex w-full items-stretch border-b border-line max-lg:flex-col">
      <div className="relative min-w-0 flex-4 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 75vw"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(98%_0.005_90/0.85)_12%,oklch(98%_0.005_90/0.2)_45%,oklch(98%_0.005_90/0.7)_78%,oklch(98%_0.005_90)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,oklch(98%_0.005_90/0.9)_92%)]" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
          {PETALS.map((petal) => (
            <span
              key={petal.left + petal.delay}
              className="absolute top-[-6%] rounded-[0_60%_0_60%] bg-sakura/80"
              style={{
                left: petal.left,
                width: petal.size,
                height: petal.size,
                animation: `petal-fall ${petal.duration} ease-in-out infinite`,
                animationDelay: petal.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex min-h-[380px] items-center px-4 py-12 md:min-h-[460px] md:px-10 md:py-14">
          <div
            className="pointer-events-none absolute top-[-20px] left-[-60px] z-10 size-[220px] animate-drift opacity-50"
            aria-hidden
          >
            <BlossomCluster />
          </div>

          <div className="relative z-10 max-w-[56%] max-lg:max-w-full">
            <p className="mb-3.5 animate-fade-in-up text-[13px] font-bold tracking-[2px] text-accent">
              {t.heroKicker}
            </p>
            <h1 className="mb-5 animate-fade-in-up text-[30px] leading-[1.15] font-black [animation-delay:0.1s] sm:text-[36px] lg:text-[52px]">
              {t.heroTitle1}
              <br />
              {t.heroTitle2} <span className="text-accent">{t.heroAccent}</span>
              {t.heroTitle3}
            </h1>
            <p className="mb-7 max-w-[440px] animate-fade-in-up text-[14.5px] leading-[1.7] text-ink-muted [animation-delay:0.2s] md:text-base">
              {t.heroDesc}
            </p>
            <Link
              href={`/${locale}/products`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "animate-fade-in-up [animation-delay:0.3s]",
              )}
            >
              {t.heroCta} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Slides are all mounted and toggled with opacity so Next can preload
            them; only the active one is interactive. */}
        <div className="absolute right-6 bottom-0 z-10 h-[367px] w-[420px] max-w-[44%] max-lg:hidden">
          {SLIDES.map((slide, slideIndex) => (
            <div
              key={slide}
              aria-hidden={slideIndex !== index}
              className={cn(
                "absolute inset-0",
                phase === "parked" ? "transition-none" : "transition-[transform,opacity] duration-[620ms] ease-[cubic-bezier(.65,.02,.25,1)]",
                slideIndex !== index
                  ? "translate-x-[140%] opacity-0"
                  : hidden
                    ? "translate-x-[140%] opacity-15"
                    : "translate-x-0 opacity-100",
              )}
            >
              <Image
                src={slide}
                alt=""
                fill
                sizes="420px"
                priority={slideIndex === 0}
                className="object-contain"
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {SLIDES.map((slide, slideIndex) => (
              <button
                key={slide}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`${slideIndex + 1}`}
                aria-current={slideIndex === index}
                className={cn(
                  "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                  slideIndex === index ? "w-6 bg-ink-strong" : "w-1.5 bg-ink-strong/30",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stacked beside the hero on desktop; below `lg` it becomes a two-up
          grid rather than four boxes squeezed into one row. */}
      <CategoryHighlights categories={categories} />
    </section>
  );
}
