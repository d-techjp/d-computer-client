"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useAuthActions, useAuthUser } from "@/features/auth/store/auth.store";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { toApiError } from "@/lib/api/errors";

import { updateProfile } from "../api/account.repository";
import { fieldClass, formatDate } from "../lib/format";
import { PanelHeading } from "./panel-heading";

export function ProfilePanel() {
  const { t } = useI18n();
  const user = useAuthUser();
  const { setUser } = useAuthActions();
  const showToast = useUiStore((state) => state.showToast);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const dirty = fullName.trim() !== user.fullName || phone.trim() !== (user.phone ?? "");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({
        fullName: fullName.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
      setUser(updated);
      showToast(t.account.saved);
    } catch (cause) {
      setError(toApiError(cause).message || t.account.loadError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <PanelHeading title={t.account.profileTitle} description={t.account.profileDesc} />

      <form onSubmit={(event) => void onSubmit(event)} className="max-w-xl space-y-5">
        <label className="block">
          <span className="mb-2 block text-[12.5px] font-bold">{t.account.email}</span>
          <input value={user.email ?? ""} disabled className={fieldClass} />
          <span className="mt-1.5 block text-[11.5px] text-ink-faint">
            {t.account.emailLocked}
            {user.hasGoogleLogin ? ` ・ ${t.account.googleLinked}` : ""}
          </span>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[12.5px] font-bold">
              {t.checkoutFullName}
              <span className="ml-1 text-accent">*</span>
            </span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={150}
              required
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12.5px] font-bold">
              {t.checkoutPhone}
              <span className="ml-1 font-normal text-ink-faint">({t.checkoutOptional})</span>
            </span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              minLength={9}
              maxLength={20}
              className={fieldClass}
            />
          </label>
        </div>

        {error ? (
          <p role="alert" className="text-[13px] text-[#B42318]">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
          <span className="text-[12px] text-ink-faint">
            {t.account.memberSince}: {formatDate(user.createdAt)}
          </span>
          <Button type="submit" size="sm" disabled={!dirty || saving}>
            {saving ? t.account.saving : t.account.save}
          </Button>
        </div>
      </form>
    </section>
  );
}
