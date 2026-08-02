import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes so a caller's `className` actually wins.
 * `clsx` resolves conditionals; `twMerge` drops earlier classes that conflict
 * on the same property (`px-4` + `px-8` → `px-8`, not both).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
