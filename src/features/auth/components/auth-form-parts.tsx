"use client";

import type { RefObject } from "react";

import { useI18n } from "@/i18n/i18n-provider";

import { GoogleSignInButton, googleSignInEnabled } from "./google-sign-in-button";

/** Google button plus the "or" divider; renders nothing when Google is not configured. */
export function AuthSocial({ onCredential }: { onCredential: (idToken: string) => void }) {
  const { locale, t } = useI18n();
  if (!googleSignInEnabled) return null;

  return (
    <>
      <GoogleSignInButton locale={locale} onCredential={onCredential} />
      <div className="my-5 flex items-center gap-3 text-[12px] text-ink-faint" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        {t.authOr}
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

/** The captcha slot and the error line, in the order they sit above the submit button. */
export function AuthCaptchaAndError({
  containerRef,
  error,
  captchaFailed,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  error: string | null;
  captchaFailed: boolean;
}) {
  const { t } = useI18n();
  // A request error wins; otherwise explain why the button will not enable.
  const message = error ?? (captchaFailed ? t.authErrors.captchaUnavailable : null);

  return (
    <>
      {/* Fixed height so the widget appearing does not shove the button down. */}
      <div ref={containerRef} className="flex min-h-[65px] justify-center" />
      {message ? (
        <p role="alert" className="rounded-md bg-[#FFF1EF] px-3.5 py-2.5 text-[13px] text-[#8A2722]">
          {message}
        </p>
      ) : null}
    </>
  );
}
