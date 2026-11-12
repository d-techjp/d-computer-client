"use client";

import { CheckIcon } from "@/components/ui/icons";
import type { CartNotice } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

/**
 * The drawer's top banner after an add-to-cart. `aria-live` so screen readers
 * hear the outcome even though focus stays on the drawer's close button.
 */
export function CartDrawerNotice({ notice }: { notice: Exclude<CartNotice, null> }) {
  const { t } = useI18n();
  const tone =
    notice.status === "pending" || notice.status === "added"
      ? "success"
      : notice.status === "adjusted"
        ? "warning"
        : "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-fade-in flex flex-none items-start gap-3 border-b px-5 py-3.5 text-[13px]",
        tone === "success" && "border-[#CFE7D5] bg-[#EFFAF1] text-[#245B32]",
        tone === "warning" && "border-[#F1DFAE] bg-[#FFF8E8] text-[#73520B]",
        tone === "error" && "border-[#F1CBC8] bg-[#FFF1EF] text-[#8A2722]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-px flex size-6 flex-none items-center justify-center rounded-full",
          tone === "success" && "bg-[#BDE8C6] text-[#246B39]",
          tone === "warning" && "bg-[#FFE8A5] text-[#8A6208]",
          tone === "error" && "bg-[#FFD4D0] text-[#9B302A]",
        )}
      >
        {notice.status === "pending" ? (
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : tone === "success" ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <span className="text-xs font-bold">!</span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        {/* Nothing reached the cart on an error, so the reason itself is the headline. */}
        <span className="block font-bold">
          {notice.status === "pending"
            ? t.cartDrawerAdding
            : tone === "error"
              ? notice.message
              : t.cartDrawerAdded}
        </span>
        <span className="mt-0.5 block truncate opacity-80">{notice.productName}</span>
        {notice.message && tone !== "error" ? (
          <span className="mt-1 block text-[12px] font-semibold">{notice.message}</span>
        ) : null}
      </span>
    </div>
  );
}
