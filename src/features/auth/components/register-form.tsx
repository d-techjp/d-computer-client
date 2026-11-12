"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n-provider";

import { loginWithGoogle, register } from "../api/auth.repository";
import { PASSWORD_RULE } from "../api/auth.schema";
import { useAuthSubmit } from "../hooks/use-auth-submit";
import { useRedirectIfSignedIn } from "../hooks/use-redirect-if-signed-in";
import { AuthCaptchaAndError, AuthSocial } from "./auth-form-parts";
import { AuthField } from "./auth-field";

const EMPTY_FORM = { fullName: "", email: "", password: "", phone: "" };

export function RegisterForm({ next }: { next: string | null }) {
  const { locale, t } = useI18n();
  const { turnstile, pending, error, run, canSubmit } = useAuthSubmit(next);
  const [form, setForm] = useState(EMPTY_FORM);
  useRedirectIfSignedIn(next);

  const update = (field: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const phone = form.phone.trim();
    void run("register", (captchaToken) =>
      register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        // The API rejects an empty string; leaving the field blank means "none".
        ...(phone ? { phone } : {}),
        captchaToken,
      }),
    );
  };

  const loginHref = `/${locale}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <>
      <AuthSocial
        onCredential={(idToken) =>
          void run("google", (captchaToken) => loginWithGoogle({ idToken, captchaToken }))
        }
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label={t.authFullNameLabel}
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={150}
          value={form.fullName}
          onChange={(event) => update("fullName")(event.target.value)}
          disabled={pending}
        />
        <AuthField
          label={t.authEmailLabel}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          value={form.email}
          onChange={(event) => update("email")(event.target.value)}
          disabled={pending}
        />
        <AuthField
          label={t.authPasswordLabel}
          name="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          // Same rule as the backend, so the browser blocks a weak password
          // before it costs a captcha token and a round trip.
          pattern={PASSWORD_RULE.source}
          hint={t.authPasswordHint}
          value={form.password}
          onChange={(event) => update("password")(event.target.value)}
          disabled={pending}
        />
        <AuthField
          label={t.authPhoneLabel}
          name="tel"
          type="tel"
          autoComplete="tel"
          maxLength={20}
          value={form.phone}
          onChange={(event) => update("phone")(event.target.value)}
          disabled={pending}
        />

        <AuthCaptchaAndError
          containerRef={turnstile.containerRef}
          error={error}
          captchaFailed={turnstile.failed}
        />

        <Button type="submit" size="block" disabled={!canSubmit}>
          {pending
            ? t.authSubmitting
            : turnstile.token
              ? t.authSubmitRegister
              : t.authCaptchaPending}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-muted">
        {t.authHaveAccount}{" "}
        <Link href={loginHref} className="font-bold text-accent hover:underline">
          {t.authGoLogin}
        </Link>
      </p>
    </>
  );
}
