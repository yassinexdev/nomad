"use client";

import { useTranslations } from "next-intl";
import { FaCheckCircle, FaMoneyBillWave, FaTruck } from "react-icons/fa";
import { OrderCta, UNIT_PRICE, PRODUCT_CODE } from "./order-cta";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export function ProductNovaClient() {
  const t = useTranslations("ProductNova101");
  const tOrder = useTranslations("Order");
  const bullets = t.raw("bullets") as string[];

  return (
    <>
      <div className="flex flex-col gap-4 md:sticky md:top-8">
      <div>
        <div className="flex flex-col gap-1">
          <h1 className="inline-flex items-baseline gap-2 text-3xl font-semibold tracking-tight text-foreground">
            <span>{t("title")}</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("seriesLabel")}</span>
          </h1>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {UNIT_PRICE} {tOrder("currency")}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
              <FaTruck className="size-3.5" />
              {tOrder("trustBadgeDelivery")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
              <FaMoneyBillWave className="size-3.5" />
              {tOrder("trustBadgePayment")}
            </span>
          </div>
        </div>
      </div>

      <OrderCta />

      <div className="pt-2">
        <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </div>

      <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {bullets.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <FaCheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <FaCheckCircle className="size-5" />
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{t("qualityBadge.title")}</p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{t("qualityBadge.description")}</p>
        </div>
      </div>
      </div>
      <WhatsAppFloat productName={PRODUCT_CODE} />
    </>
  );
}
