"use client";

import { useEffect } from "react";

import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { useUiStore } from "@/features/layout/store/ui.store";

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
      className="animate-fade-in-up fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 z-80 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 border border-[#D4AF37]/45 bg-[#FFFDF8]/96 px-4 py-3 text-[13px] font-semibold text-[#1C1B18] shadow-pop backdrop-blur"
    >
      <span className="flex size-6 flex-none items-center justify-center rounded-full bg-[#FFD700]/20 text-[#A98520]">
        <CheckIcon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate">{toast.message}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close notification"
        className="cursor-pointer text-ink-muted transition-colors hover:text-ink"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
