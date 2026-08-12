"use client";

import { useSyncExternalStore } from "react";

type SocialBubble = {
  href: string;
  src: string;
  label: string;
  /** Brand colour behind the pulsing ring, as a CSS colour value. */
  ringColor: string;
};

const SOCIAL_BUBBLES: SocialBubble[] = [
  {
    href: "https://www.facebook.com/nguyenviet.dung.92",
    src: "/fb.png",
    label: "Fanpage Facebook",
    ringColor: "rgba(24,119,242,0.55)",
  },
  {
    href: "https://www.tiktok.com/@dcomputer7?_r=1&_t=ZS-98octHc6xDp",
    src: "/tiktok.png",
    label: "TikTok Shop",
    ringColor: "rgba(254,44,85,0.5)",
  },
  {
    href: "https://beacons.ai/dcomputer",
    src: "/beacons.png",
    label: "Beacons – Link Bio",
    ringColor: "rgba(120,53,15,0.5)",
  },
];

/** localStorage key remembering whether the user collapsed the bubble stack. */
const STORAGE_KEY = "social-bubbles-visible";

/**
 * `localStorage` is an external store, so the preference is read through
 * `useSyncExternalStore` rather than mirrored into `useState` from an effect:
 * the server renders the expanded default, the client swaps to the stored
 * value during hydration, and no cascading render happens in between.
 */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Keeps two tabs in agreement — `storage` only fires in the *other* tabs.
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function isVisible(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) !== "hidden";
}

/** No storage on the server: render expanded, which is the first-visit state. */
function isVisibleOnServer(): boolean {
  return true;
}

function storeVisible(visible: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, visible ? "visible" : "hidden");
  for (const listener of listeners) listener();
}

/**
 * Fixed vertical stack of social bubbles (Facebook / TikTok / Beacons), kept
 * small and edge-anchored so they never sit over primary content or the
 * mobile thumb-reach zone. Sits at z-40 — below the header/menu/cart overlays
 * (z-60/70/80) so it's correctly obscured whenever one of those is open.
 * A toggle button lets users collapse the stack if they find it distracting;
 * the choice is remembered across visits.
 */
export function SocialBubbles() {
  const visible = useSyncExternalStore(subscribe, isVisible, isVisibleOnServer);

  return (
    <nav
      aria-label="Mạng xã hội"
      // Below `lg` the bottom edge belongs to `<CartBar>`, so the stack starts
      // above it rather than overlapping the cart total.
      className="fixed right-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-2.5 sm:right-5 sm:gap-3 lg:bottom-7"
    >
      {SOCIAL_BUBBLES.map(({ href, src, label, ringColor }, index) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          className={`group relative flex transition-all duration-300 ease-out ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-75 opacity-0"
          }`}
          style={{ transitionDelay: `${(visible ? SOCIAL_BUBBLES.length - 1 - index : index) * 40}ms` }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full motion-safe:animate-ping"
            style={{
              backgroundColor: ringColor,
              animationDuration: "2.4s",
              animationDelay: `${index * 0.3}s`,
            }}
          />
          <span className="relative size-8 overflow-hidden rounded-full ring-2 ring-white shadow-lift transition-transform duration-200 group-hover:scale-110 sm:size-9">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image processing */}
            <img src={src} alt="" className="size-full object-cover" />
          </span>
          <span className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 translate-x-1 rounded-md bg-ink-strong px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lift transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 lg:block">
            {label}
          </span>
        </a>
      ))}

      <button
        type="button"
        onClick={() => storeVisible(!visible)}
        aria-expanded={visible}
        aria-label={visible ? "Ẩn liên kết mạng xã hội" : "Hiện liên kết mạng xã hội"}
        className="flex size-7 items-center justify-center rounded-full bg-white/90 text-ink-strong shadow-lift ring-1 ring-black/5 backdrop-blur transition-transform duration-200 hover:scale-110 sm:size-8"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3.5 transition-transform duration-200 sm:size-4 ${visible ? "" : "rotate-180"}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </nav>
  );
}
