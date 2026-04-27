import { getOrders } from "@/lib/orders-db";
import type { OrderRow } from "@/lib/orders-db";
import { LogoutButton } from "./logout-button";
import { PeriodFilter } from "./period-filter";
import type { Period } from "./period-filter";
import { RevenueChart } from "./revenue-chart";
import { ExportCsvButton } from "./export-csv-button";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function LocaleBadge({ locale }: { locale: string }) {
  const map: Record<string, { label: string; color: string }> = {
    fr: { label: "FR", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    ar: { label: "AR", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    en: { label: "EN", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  };
  const entry = map[locale] ?? { label: locale.toUpperCase(), color: "bg-zinc-700 text-zinc-300 border-zinc-600" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${entry.color}`}>
      {entry.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function getStartOfPeriod(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "week": {
      const start = new Date(now);
      const day = start.getDay();
      // Monday-based week
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "all":
    default:
      return null;
  }
}

function getPeriodLabel(period: Period): string {
  switch (period) {
    case "today":
      return "aujourd'hui";
    case "week":
      return "cette semaine";
    case "month":
      return "ce mois";
    default:
      return "toutes";
  }
}

export default async function OrdersDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as Period) || "all";

  const allOrders = await getOrders();

  // Filter by period
  const startDate = getStartOfPeriod(period);
  const orders = startDate
    ? allOrders.filter((o) => new Date(o.created_at) >= startDate)
    : allOrders;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalQty = orders.reduce((sum, o) => sum + o.qty, 0);
  const cities = new Set(orders.map((o) => o.city)).size;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-emerald-600/8 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Zed Market</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Dashboard Admin</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Period filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white">Commandes</h2>
          <Suspense fallback={null}>
            <PeriodFilter />
          </Suspense>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <StatCard label="Commandes" value={orders.length} sub={getPeriodLabel(period)} accent="text-white" />
          <StatCard label="Chiffre d'affaires" value={`${totalRevenue.toLocaleString()} DH`} sub={getPeriodLabel(period)} accent="text-emerald-400" />
          <StatCard label="Articles vendus" value={totalQty} sub="Total paires" />
          <StatCard label="Villes" value={cities} sub="Villes distinctes" />
        </div>

        {/* Revenue chart */}
        <div className="mb-8">
          <RevenueChart orders={allOrders} />
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Liste des commandes{" "}
            <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {orders.length}
            </span>
          </h3>
          <ExportCsvButton orders={orders} />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  {["Date", "Produit", "Pointure", "Qté", "Ville", "Téléphone", "Nom", "Notes", "Total", "Langue"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 first:rounded-tl-2xl last:rounded-tr-2xl"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-zinc-600">
                      Aucune commande {period !== "all" ? getPeriodLabel(period) : ""}.
                    </td>
                  </tr>
                ) : (
                  orders.map((order: OrderRow, i: number) => (
                    <tr
                      key={order.id}
                      className={`border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/30 ${
                        i === 0 ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-400">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {order.product_code}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-white">
                          EU {order.size}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{order.qty}</td>
                      <td className="px-4 py-3 text-zinc-300 capitalize">{order.city}</td>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{order.phone}</td>
                      <td className="px-4 py-3 text-zinc-400">{order.name ?? <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-zinc-500 text-xs" title={order.notes ?? ""}>
                        {order.notes ?? <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        {order.total_price} DH
                      </td>
                      <td className="px-4 py-3">
                        <LocaleBadge locale={order.locale} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
