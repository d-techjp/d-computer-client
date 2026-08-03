import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The "title on the left, view-all link on the right" band repeated by the
 * products and blog sections. Extracted because it appeared twice with slightly
 * different markup in the original — a class of drift this removes.
 */
export function SectionHeading({
  title,
  action,
  actionHref,
}: {
  title: ReactNode;
  action?: ReactNode;
  actionHref?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <h2 className="border-l-[5px] border-accent pl-3.5 text-[22px] font-black md:text-[26px]">
        {title}
      </h2>
      {action ? (
        <Link
          href={actionHref ?? "#"}
          className="flex flex-none items-center gap-1 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-accent md:text-sm"
        >
          {action} →
        </Link>
      ) : null}
    </div>
  );
}
