"use client";

import { useEffect } from "react";

import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { useUiStore } from "@/features/layout/store/ui.store";
import { cn } from "@/lib/utils/cn";

/** A concise confirmation for add-to-cart; it never competes with the cart drawer. */
export function CartAddToast() {
  const toast = useUiStore((state) => state.toast);
  const dismiss = useUiStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(dismiss, 3200);
    return () => window.clearTimeout(timeout);
  }, [dismiss, toast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className={cn(
        "animate-fade-in-up fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 z-80 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 border px-4 py-3 text-[13px] font-semibold shadow-pop backdrop-blur",
        toast.tone === "success" && "border-[#9DCCAA] bg-[#EFFAF1]/96 text-[#245B32]",
        toast.tone === "warning" && "border-[#E5BF5B] bg-[#FFF8E8]/96 text-[#73520B]",
        toast.tone === "error" && "border-[#E5A4A0] bg-[#FFF1EF]/96 text-[#8A2722]",
      )}
    >
      <span
        className={cn(
          "flex size-6 flex-none items-center justify-center rounded-full",
          toast.tone === "success" && "bg-[#BDE8C6] text-[#246B39]",
          toast.tone === "warning" && "bg-[#FFE8A5] text-[#8A6208]",
          toast.tone === "error" && "bg-[#FFD4D0] text-[#9B302A]",
        )}
      >
        {toast.tone === "success" ? <CheckIcon className="size-3.5" /> : "!"}
      </span>
      <span className="min-w-0 flex-1 truncate">{toast.message}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close notification"
        className="cursor-pointer opacity-65 transition-opacity hover:opacity-100"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
