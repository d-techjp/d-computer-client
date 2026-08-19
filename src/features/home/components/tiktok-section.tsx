"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PublicTiktokVideo } from "@/features/home/api/tiktok-video.schema";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@dcomputer7?_r=1&_t=ZS-98octHc6xDp";

/**
 * Videos are managed in admin. A TikTok player is loaded only after a visitor
 * chooses a card, preventing five third-party embeds from delaying the homepage.
 */
export function TikTokSection({
  t,
  videos,
  showAction = true,
}: {
  t: Dictionary;
  videos: PublicTiktokVideo[];
  showAction?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  const updateScrollPosition = () => {
    const rail = railRef.current;
    if (!rail) return;

    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  };

  const moveVideos = () => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: rail.clientWidth * (atEnd ? -0.8 : 0.8),
      behavior: "smooth",
    });
  };

  if (videos.length === 0) return null;

  return (
    <RevealSection className="shell py-12 md:py-16">
      <SectionHeading
        title={t.tiktokTitle}
        action={showAction ? t.viewAll : undefined}
        actionHref={TIKTOK_PROFILE_URL}
      />
      <p className="-mt-3 mb-6 text-[13.5px] text-ink-muted md:mb-7">{t.tiktokDesc}</p>
      <div className="relative">
        <div
          ref={railRef}
          onScroll={updateScrollPosition}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:justify-items-center sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5"
        >
          {videos.map((video) => (
            <TikTokCard key={video.id} video={video} t={t} />
          ))}
        </div>
        <button
          type="button"
          onClick={moveVideos}
          aria-label={atEnd ? t.paginationPrev : t.tiktokNextVideos}
          className="absolute top-1/2 right-1 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)] motion-safe:animate-pulse transition-transform hover:scale-110 [&>svg]:size-7 sm:hidden"
        >
          {atEnd ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>
    </RevealSection>
  );
}

function TikTokCard({
  video,
  t,
}: {
  video: PublicTiktokVideo;
  t: Dictionary;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = getTikTokVideoId(video.videoUrl);
  const canPlayInline = videoId !== null;

  return (
    <article className="w-[calc((100%-0.75rem)/2)] flex-none snap-start overflow-hidden rounded-xl border border-line bg-white shadow-card sm:w-full sm:max-w-[245px]">
      <div className="relative aspect-9/16 overflow-hidden bg-ink-strong">
        {playing && videoId ? (
          <iframe
            src={`https://www.tiktok.com/player/v1/${videoId}`}
            title={t.tiktokVideoTitle}
            className="absolute inset-0 size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (canPlayInline) setPlaying(true);
              else window.open(video.videoUrl, "_blank", "noopener,noreferrer");
            }}
            aria-label={t.tiktokPlayVideo}
            className="group absolute inset-0 cursor-pointer"
          >
            <Image
              src={video.thumbnailUrl ?? "/thumbnail-tiktok.webp"}
              alt={t.tiktokVideoTitle}
              fill
              sizes="(max-width: 640px) calc(100vw - 3rem), 340px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink-strong/15 transition-colors group-hover:bg-ink-strong/25" />
            <span className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 pl-0.5 text-lg text-ink-strong shadow-pop transition-transform group-hover:scale-110" aria-hidden>
              ▶
            </span>
          </button>
        )}
      </div>
      <p className="px-3 pt-3 text-[11.5px] leading-4 text-ink-muted">
        {video.description ?? t.tiktokVideoDescription}
      </p>
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center justify-between px-3 pb-3 text-[11.5px] font-bold text-ink-body transition-colors hover:text-accent"
      >
        <span>{t.tiktokWatchOnTikTok}</span>
        <span aria-hidden>↗</span>
      </a>
    </article>
  );
}

function getTikTokVideoId(videoUrl: string): string | null {
  return /\/video\/(\d+)/.exec(videoUrl)?.[1] ?? null;
}
