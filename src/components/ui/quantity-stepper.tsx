"use client";

import { cn } from "@/lib/utils/cn";

type QuantityStepperProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  max?: number;
  disabled?: boolean;
  labels: { increase: string; decrease: string };
  className?: string;
};

/**
 * Controlled stepper — it owns no state, only reports intent. Used by both the
 * cart lines and the product detail page, which keep their counts in different
 * places (Zustand vs. local state).
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  size = "md",
  max,
  disabled = false,
  labels,
  className,
}: QuantityStepperProps) {
  const button =
    size === "sm"
      ? "size-6 text-[13px]"
      : "size-[38px] text-base";

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border",
        size === "sm" ? "border-line rounded-[7px]" : "border-line-strong",
        className,
      )}
    >
      <button
        type="button"
        aria-label={labels.decrease}
        onClick={onDecrement}
        disabled={disabled || value <= 1}
        className={cn(
          button,
          "cursor-pointer leading-none transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        −
      </button>
      <span
        className={cn(
          "text-center font-bold tabular-nums",
          size === "sm" ? "w-[22px] text-xs" : "w-9 text-sm",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={labels.increase}
        onClick={onIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className={cn(
          button,
          "cursor-pointer leading-none transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        +
      </button>
    </div>
  );
}
