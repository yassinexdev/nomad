"use client";

import type { RevenueChartSeries } from "@/lib/orders-db";
import { useState } from "react";

type ChartView = "days" | "weeks" | "months";

const VIEW_OPTIONS: { key: ChartView; label: string }[] = [
  { key: "days", label: "30 jours" },
  { key: "weeks", label: "12 semaines" },
  { key: "months", label: "12 mois" },
];

export function RevenueChart({ series }: { series: RevenueChartSeries }) {
  const [view, setView] = useState<ChartView>("days");
  const data = series[view];
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Revenus</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalRevenue.toLocaleString()} DH · {totalOrders} commande{totalOrders !== 1 ? "s" : ""}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800/60 p-0.5">
          {VIEW_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                view === key
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
                  : "text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-44">
        {data.map((bar, i) => {
          const heightPct = maxRevenue > 0 ? (bar.revenue / maxRevenue) * 100 : 0;
          const isLast = i === data.length - 1;

          return (
            <div
              key={`${bar.label}-${i}`}
              className="group relative flex flex-1 flex-col items-center"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="whitespace-nowrap rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[10px] shadow-xl">
                  <p className="font-semibold text-white">{bar.revenue.toLocaleString()} DH</p>
                  <p className="text-zinc-400">
                    {bar.orders} commande{bar.orders !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full flex flex-col items-center justify-end h-36">
                <div
                  className={[
                    "w-full rounded-t-md transition-all duration-300",
                    view === "days" ? "max-w-[18px]" : view === "weeks" ? "max-w-[28px]" : "max-w-[36px]",
                    isLast
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                      : bar.revenue > 0
                        ? "bg-emerald-600/50 group-hover:bg-emerald-500/80"
                        : "bg-zinc-800 group-hover:bg-zinc-700",
                  ].join(" ")}
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                  }}
                />
              </div>

              {/* Label — show every label for months, every other for days on small screens */}
              <p
                className={[
                  "mt-2 leading-none whitespace-nowrap",
                  view === "days" ? "text-[8px]" : "text-[10px]",
                  isLast ? "text-emerald-400 font-semibold" : "text-zinc-600",
                  // Hide some day labels to avoid overlap
                  view !== "months" && i % 2 !== 0 && !isLast ? "hidden sm:block" : "",
                ].join(" ")}
              >
                {bar.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
