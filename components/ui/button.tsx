import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-60 dark:focus-visible:ring-zinc-700",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md",
        /** Primary green CTA: glow + hover lift + press (see `order-cta-glow` in globals.css) */
        orderCta:
          "relative overflow-hidden border border-emerald-500/90 bg-emerald-600 text-white " +
          "shadow-[0_4px_18px_-6px_rgba(16,185,129,0.55)] " +
          "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out " +
          "hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-500 hover:shadow-[0_10px_28px_-8px_rgba(52,211,153,0.55)] " +
          "active:translate-y-0 active:scale-[0.98] " +
          "motion-safe:animate-[order-cta-glow_2.8s_ease-in-out_infinite] motion-reduce:animate-none " +
          "focus-visible:ring-emerald-300 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-emerald-600 " +
          "disabled:motion-safe:animate-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        lg: "h-12 px-5 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
