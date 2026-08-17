"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Checkout runs as a single full-screen flow (form, then the order-success
 * state) with its own back-to-home link, so the shared header/topbar/footer
 * chrome would be redundant there. Mirrors the pathname-gating already used
 * by `CartBar` and `SocialBubbles`.
 */
export function SiteChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (/\/checkout(?:\/|$)/.test(pathname)) return null;

  return <>{children}</>;
}
