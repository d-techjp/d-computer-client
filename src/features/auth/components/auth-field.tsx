"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

const inputClass =
  "h-11 w-full rounded-md border border-line-strong bg-white px-3.5 text-[14px] text-ink-body outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:bg-mist";

/** Labelled input; password fields get a show/hide toggle. */
export function AuthField({ label, hint, type = "text", className, ...props }: AuthFieldProps) {
  const { t } = useI18n();
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-body">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(inputClass, isPassword && "pr-16")}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="absolute inset-y-0 right-0 cursor-pointer px-3.5 text-[12px] font-semibold text-ink-muted hover:text-accent"
          >
            {revealed ? t.authHidePassword : t.authShowPassword}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-[11.5px] leading-5 text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
