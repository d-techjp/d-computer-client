"use client";

import { useI18n } from "@/i18n/i18n-provider";
import { interpolate } from "@/lib/format/interpolate";
import { cn } from "@/lib/utils/cn";

/**
 * Prev/next paging shared by the product listing and the article listing.
 * The backend paginates server-side for both, so unlike the old twelve-item
 * mock catalogue this has to exist at all.
 *
 * Page numbers are deliberately not enumerated — with filters in play
 * `totalPages` is unpredictable, and prev/next is the one control that never
 * needs to reflow.
 */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t.paginationLabel}
      className="mt-8 flex items-center justify-center gap-4 border-t border-line-soft pt-6"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(
          "cursor-pointer rounded-lg border-[1.5px] border-line-strong px-4 py-2 text-[13px] font-bold transition-colors hover:border-accent hover:text-accent",
          page <= 1 && "cursor-not-allowed opacity-40 hover:border-line-strong hover:text-inherit",
        )}
      >
        {t.paginationPrev}
      </button>

      <span className="text-[13px] font-semibold text-ink-muted tabular-nums">
        {interpolate(t.paginationStatus, { page, totalPages })}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(
          "cursor-pointer rounded-lg border-[1.5px] border-line-strong px-4 py-2 text-[13px] font-bold transition-colors hover:border-accent hover:text-accent",
          page >= totalPages &&
            "cursor-not-allowed opacity-40 hover:border-line-strong hover:text-inherit",
        )}
      >
        {t.paginationNext}
      </button>
    </nav>
  );
}
