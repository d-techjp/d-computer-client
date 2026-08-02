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
    <div className="mb-7 flex items-baseline justify-between gap-4">
      <h2 className="border-l-[5px] border-accent pl-3.5 text-[26px] font-black">{title}</h2>
      {action ? (
        <Link
          href={actionHref ?? "#"}
          className="flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-accent"
        >
          {action} →
        </Link>
      ) : null}
    </div>
  );
}
