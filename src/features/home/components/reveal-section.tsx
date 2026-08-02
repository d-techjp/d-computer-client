"use client";

import type { ReactNode } from "react";

import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils/cn";

/**
 * A thin client wrapper that supplies only the scroll-reveal behaviour, so the
 * sections *inside* it can stay Server Components. Children passed through
 * `props.children` are rendered on the server and streamed in as an already
 * complete tree — the client component never re-renders them.
 */
export function RevealSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section ref={ref} data-revealed={revealed} className={cn("reveal", className)}>
      {children}
    </section>
  );
}
