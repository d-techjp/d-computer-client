"use client";

import { useEffect, useRef } from "react";

import { useExternalScript } from "@/hooks/use-external-script";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleIdApi = {
  initialize: (options: Record<string, unknown>) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

/** True when a Google OAuth client is configured for this build. */
export const googleSignInEnabled = Boolean(CLIENT_ID);

/**
 * Google Identity Services' own button (its look is mandated by Google's
 * branding rules). It returns an ID token, which the backend verifies against
 * our client ID — the storefront never handles a Google password or OAuth code.
 */
export function GoogleSignInButton({
  locale,
  onCredential,
}: {
  locale: string;
  onCredential: (idToken: string) => void;
}) {
  const status = useExternalScript(CLIENT_ID ? SCRIPT_SRC : null);
  const containerRef = useRef<HTMLDivElement>(null);
  // GIS keeps the first callback it is given; route through a ref so it always
  // reaches the current handler (and thus the current captcha token).
  const handlerRef = useRef(onCredential);

  useEffect(() => {
    handlerRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const container = containerRef.current;
    const api = window.google?.accounts.id;
    if (status !== "ready" || !container || !api) return;

    api.initialize({
      client_id: CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (response.credential) handlerRef.current(response.credential);
      },
      ux_mode: "popup",
      cancel_on_tap_outside: true,
    });
    api.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      locale,
      width: Math.min(container.offsetWidth || 360, 400),
    });
  }, [locale, status]);

  if (!CLIENT_ID) return null;
  return <div ref={containerRef} className="flex min-h-11 w-full justify-center" />;
}
