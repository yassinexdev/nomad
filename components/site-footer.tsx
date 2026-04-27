"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const salesPolicyHref = pathname.startsWith("/shoes/")
    ? { pathname: "/sales-policy", query: { from: pathname } }
    : "/sales-policy";

  return (
    <footer className="mt-10 border-t border-zinc-200 px-4 py-4 text-sm dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="font-mono text-lg font-bold tracking-tight text-foreground hover:opacity-80"
          aria-label="Zed Market"
        >
          Z
        </Link>
        <Link href={salesPolicyHref} className="text-zinc-600 hover:underline dark:text-zinc-300">
          {t("salesPolicy")}
        </Link>
        <LanguageSwitcher />
      </div>
    </footer>
  );
}
