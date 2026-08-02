import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Variants live in data, not in a chain of ternaries inside JSX.
 * `cva` gives every call site the same vocabulary (`variant`, `size`) and lets
 * TypeScript reject `variant="primry"` at compile time.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-md font-bold transition-[transform,box-shadow,background-color] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-strong text-white hover:-translate-y-0.5 hover:shadow-[0_12px_24px_oklch(15%_0.01_260/0.25)]",
        outline:
          "border-[1.5px] border-line-strong text-ink-body hover:border-accent hover:text-accent",
        ghost: "text-ink-muted hover:text-accent",
      },
      size: {
        sm: "px-4 py-2 text-[13px]",
        md: "px-6 py-3.5 text-[14.5px]",
        lg: "px-[30px] py-[15px] text-[15px]",
        block: "w-full px-5 py-3.5 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
