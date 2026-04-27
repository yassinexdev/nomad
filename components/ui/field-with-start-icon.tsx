"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const shell =
  "flex w-full divide-x divide-zinc-200 overflow-hidden rounded-xl border bg-white shadow-sm transition dark:divide-zinc-700 dark:bg-zinc-900";

const shellNormal =
  "border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-200 dark:border-zinc-700 dark:focus-within:border-zinc-500 dark:focus-within:ring-zinc-800";

const shellError =
  "border-red-300 ring-1 ring-red-300 dark:border-red-500/70 dark:ring-red-500/50";

const iconCell =
  "flex shrink-0 items-center justify-center bg-zinc-100 px-3.5 text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-300";

type InputProps = React.ComponentProps<typeof Input>;

export function InputWithStartIcon({
  icon,
  rtl,
  error,
  className,
  ...props
}: InputProps & {
  icon: React.ReactNode;
  rtl?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        shell,
        error ? shellError : shellNormal,
        rtl && "flex-row-reverse divide-x-reverse",
        className
      )}
    >
      <span className={iconCell} aria-hidden>
        {icon}
      </span>
      <Input
        className={cn(
          "h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-2 shadow-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        {...props}
      />
    </div>
  );
}

type TextareaProps = React.ComponentProps<typeof Textarea>;

export function TextareaWithStartIcon({
  icon,
  rtl,
  error,
  className,
  ...props
}: TextareaProps & {
  icon: React.ReactNode;
  rtl?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        shell,
        error ? shellError : shellNormal,
        rtl && "flex-row-reverse divide-x-reverse",
        className
      )}
    >
      <span className={cn(iconCell, "items-start pt-3")} aria-hidden>
        {icon}
      </span>
      <Textarea
        className={cn(
          "min-h-24 min-w-0 flex-1 resize-y rounded-none border-0 bg-transparent px-3 py-2.5 shadow-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        {...props}
      />
    </div>
  );
}
