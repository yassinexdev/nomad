"use client";

import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <Link
        href="/"
        className="font-mono text-lg font-bold tracking-tight text-foreground hover:opacity-80"
        aria-label="Zed Market"
      >
        Z
      </Link>
    </header>
  );
}
