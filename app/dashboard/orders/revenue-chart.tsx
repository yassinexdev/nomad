"use client";

import type { OrderRow } from "@/lib/orders-db";
import { useMemo, useState } from "react";

type BarData = {
  label: string;
  revenue: number;
  orders: number;
};

type ChartView = "days" | "weeks" | "months";

function buildDailyData(orders: OrderRow[], days: number): BarData[] {
  const now = new Date();
  const result: BarData[] = [];

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    const prev = byDay.get(key) ?? { revenue: 0, orders: 0 };
    prev.revenue += o.total_price;
    prev.orders += 1;
    byDay.set(key, prev);
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("fr-MA", {
      day: "2-digit",
      month: "short",
    }).format(d);
    const agg = byDay.get(key);
    result.push({ label, revenue: agg?.revenue ?? 0, orders: agg?.orders ?? 0 });
  }

  return result;
}

function startOfWeekMonday(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const day = out.getDay(); // 0..6 (Sun..Sat)
  const diff = day === 0 ? 6 : day - 1; // Monday-based
  out.setDate(out.getDate() - diff);
  return out;
}

function getYearWeekKey(d: Date) {
  // ISO-ish week key based on Monday start; sufficient for chart grouping.
  const start = startOfWeekMonday(d);
  const year = start.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const week1 = startOfWeekMonday(jan4);
  const week = Math.floor((start.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const padded = String(week).padStart(2, "0");
  return `${year}-W${padded}`;
}

function buildWeeklyData(orders: OrderRow[], weeks: number): BarData[] {
  const now = new Date();
  const result: BarData[] = [];

  const byWeek = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const od = new Date(o.created_at);
    const key = getYearWeekKey(od);
    const prev = byWeek.get(key) ?? { revenue: 0, orders: 0 };
    prev.revenue += o.total_price;
    prev.orders += 1;
    byWeek.set(key, prev);
  }

  const currentWeekStart = startOfWeekMonday(now);
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    const key = getYearWeekKey(ws);
    const label = new Intl.DateTimeFormat("fr-MA", {
      day: "2-digit",
      month: "short",
    }).format(ws);
    const agg = byWeek.get(key);
    result.push({ label, revenue: agg?.revenue ?? 0, orders: agg?.orders ?? 0 });
  }

  return result;
}

function buildMonthlyData(orders: OrderRow[]): BarData[] {
  const now = new Date();
  const result: BarData[] = [];

  const byMonth = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const od = new Date(o.created_at);
    const key = `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, "0")}`;
    const prev = byMonth.get(key) ?? { revenue: 0, orders: 0 };
    prev.revenue += o.total_price;
    prev.orders += 1;
    byMonth.set(key, prev);
  }

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("fr-MA", {
      month: "short",
      year: "2-digit",
    }).format(d);
    const agg = byMonth.get(yearMonth);
    result.push({ label, revenue: agg?.revenue ?? 0, orders: agg?.orders ?? 0 });
  }

  return result;
}

const VIEW_OPTIONS: { key: ChartView; label: string }[] = [
  { key: "days", label: "30 jours" },
  { key: "weeks", label: "12 semaines" },
  { key: "months", label: "12 mois" },
];

export function RevenueChart({ orders }: { orders: OrderRow[] }) {
  const [view, setView] = useState<ChartView>("days");

  const data = useMemo(
    () =>
      view === "days"
        ? buildDailyData(orders, 30)
        : view === "weeks"
          ? buildWeeklyData(orders, 12)
          : buildMonthlyData(orders),
    [orders, view],
  );
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
