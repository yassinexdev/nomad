"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-8 sm:py-5 dark:border-zinc-800">
      <Link
        href="/"
        className="flex items-center hover:opacity-70 transition-opacity duration-200"
        aria-label="Nomad"
      >
        <Image
          src="/nomad-logo.png"
          alt="Nomad"
          width={160}
          height={48}
          priority
          style={{ width: "auto", height: "auto" }}
          className="h-8 sm:h-10 md:h-11 dark:invert"
        />
      </Link>
    </header>
  );
}
