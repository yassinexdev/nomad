"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity"
        aria-label="Nomad"
      >
        <Image
          src="/nomad-logo.png"
          alt="Nomad"
          width={120}
          height={36}
          priority
          className="h-9 w-auto dark:invert"
        />
      </Link>
    </header>
  );
}
