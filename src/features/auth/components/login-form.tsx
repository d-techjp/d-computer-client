"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n-provider";

import { login, loginWithGoogle } from "../api/auth.repository";
import { useAuthSubmit } from "../hooks/use-auth-submit";
import { useRedirectIfSignedIn } from "../hooks/use-redirect-if-signed-in";
import { AuthCaptchaAndError, AuthSocial } from "./auth-form-parts";
import { AuthField } from "./auth-field";

export function LoginForm({ next }: { next: string | null }) {
  const { locale, t } = useI18n();
  const { turnstile, pending, error, run, canSubmit } = useAuthSubmit(next);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useRedirectIfSignedIn(next);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void run("login", (captchaToken) => login({ username, password, captchaToken }));
  };

  const registerHref = `/${locale}/register${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <>
      <AuthSocial
        onCredential={(idToken) =>
          void run("google", (captchaToken) => loginWithGoogle({ idToken, captchaToken }))
        }
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
        <AuthField
          label={t.authIdentifierLabel}
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={255}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={pending}
        />
        <AuthField
          label={t.authPasswordLabel}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
        />

        <AuthCaptchaAndError
          containerRef={turnstile.containerRef}
          error={error}
          captchaFailed={turnstile.failed}
        />

        <Button type="submit" size="block" disabled={!canSubmit}>
          {pending ? t.authSubmitting : turnstile.token ? t.authSubmitLogin : t.authCaptchaPending}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-muted">
        {t.authNoAccount}{" "}
        <Link href={registerHref} className="font-bold text-accent hover:underline">
          {t.authCreateAccount}
        </Link>
      </p>
    </>
  );
}
