"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

import type { SpecRow } from "../types";

const COLLAPSED_ROWS = 5;

export function SpecTable({
  rows,
  labels,
}: {
  rows: SpecRow[];
  labels: { title: string; showAll: string; showLess: string };
}) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = rows.length > COLLAPSED_ROWS;
  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  return (
    <div className="mb-6">
      <h2 className="mb-2.5 text-sm font-bold">{labels.title}</h2>

      <dl className="overflow-hidden rounded-xl border border-line-soft">
        {visible.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[1fr_1.4fr]",
              index % 2 === 0 ? "bg-white" : "bg-mist-soft",
              index > 0 && "border-t border-line-soft",
            )}
          >
            <dt className="px-4 py-3 text-[13px] font-bold text-ink-body">{row.label}</dt>
            <dd className="px-4 py-3 text-[13px] text-ink-body">{row.value}</dd>
          </div>
        ))}
      </dl>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-line-strong px-4 py-2.5 text-[13.5px] font-bold text-ink-body transition-colors hover:border-accent hover:text-accent"
        >
          {expanded ? labels.showLess : labels.showAll}
          <span
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden
          >
            ▾
          </span>
        </button>
      ) : null}
    </div>
  );
}
