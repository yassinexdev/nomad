"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { FaShoppingBag } from "react-icons/fa";
import { UNIT_PRICE } from "./order-cta";

export function StickyMobileOrderBar() {
  const t = useTranslations("Order");

  function scrollToOrder() {
    document.getElementById("order-section")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-end justify-between gap-3 px-4">
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("stickyBarLabel")}
          </p>
          <p className="truncate text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {UNIT_PRICE} {t("currency")}
          </p>
        </div>
        <Button
          type="button"
          variant="orderCta"
          size="lg"
          className="motion-safe:animate-none shrink-0 px-4 sm:px-5"
          onClick={scrollToOrder}
        >
          <FaShoppingBag className="size-4 shrink-0" aria-hidden />
          {t("orderButton")}
        </Button>
      </div>
    </div>
  );
}

