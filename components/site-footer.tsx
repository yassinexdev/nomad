"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const salesPolicyHref = pathname.startsWith("/shoes/")
    ? { pathname: "/sales-policy", query: { from: pathname } }
    : "/sales-policy";

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Main footer row */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">

        {/* Logo + tagline */}
        <div className="flex flex-col gap-2">
          <Link href="/" aria-label="Nomad" className="hover:opacity-70 transition-opacity duration-200">
            <Image
              src="/nomad-logo.png"
              alt="Nomad"
              width={120}
              height={36}
              style={{ width: "auto", height: "auto" }}
              className="h-7 dark:invert"
            />
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("tagline")}
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Footer navigation">
          <Link href={salesPolicyHref} className="text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            {t("salesPolicy")}
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "212600000000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            {t("contact")}
          </a>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-5 py-3 sm:px-8">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {year} Nomad. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
