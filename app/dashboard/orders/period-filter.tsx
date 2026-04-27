"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
  { key: "all", label: "Tout" },
] as const;

export type Period = (typeof PERIODS)[number]["key"];

export function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as Period) || "today";

  function handleClick(period: Period) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "all") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const qs = params.toString();
    router.push(`/dashboard/orders${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.map(({ key, label }) => {
        const active = current === key;
        return (
          <button
            key={key}
            id={`filter-${key}`}
            onClick={() => handleClick(key)}
            className={[
              "rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
              active
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "border border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
