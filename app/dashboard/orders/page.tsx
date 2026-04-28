import { getOrders, getRevenueChartSeries } from "@/lib/orders-db";
import type { OrderRow, RevenueChartSeries } from "@/lib/orders-db";
import { isDashboardAuthed } from "@/lib/dashboard-auth";
import { LogoutButton } from "./logout-button";
import { PeriodFilter } from "./period-filter";
import type { Period } from "./period-filter";
import { RevenueChart } from "./revenue-chart";
import { ExportCsvButton } from "./export-csv-button";
import { OrderRowActions } from "./order-row-actions";
import { Suspense } from "react";
import { redirect } from "next/navigation";

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

function parseYmdToLocalDate(ymd: string): Date | null {
  // Expect "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfLocalDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function endOfLocalDay(d: Date) {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

function filterOrdersByTimeWindow(orders: OrderRow[], opts: { period: Period; from?: string; to?: string }) {
  const fromDate = opts.from ? parseYmdToLocalDate(opts.from) : null;
  const toDate = opts.to ? parseYmdToLocalDate(opts.to) : null;

  const rangeStart = fromDate ? startOfLocalDay(fromDate) : getStartOfPeriod(opts.period);
  const rangeEnd = toDate ? endOfLocalDay(toDate) : null;

  if (!rangeStart && !rangeEnd) return orders;
  return orders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    if (Number.isNaN(t)) return false;
    if (rangeStart && t < rangeStart.getTime()) return false;
    if (rangeEnd && t > rangeEnd.getTime()) return false;
    return true;
  });
}

type OrderStatus = OrderRow["status"];

function computeOrderKpis(ordersInPeriod: OrderRow[]) {
  const counts: Record<OrderStatus, number> = {
    new: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const o of ordersInPeriod) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }

  const total = ordersInPeriod.length;
  const inProgress = counts.new + counts.confirmed + counts.shipped;
  const nonCancelled = total - counts.cancelled;
  const deliveryRate = nonCancelled > 0 ? counts.delivered / nonCancelled : 0;
  const cancelRate = total > 0 ? counts.cancelled / total : 0;
  const totalRevenue = ordersInPeriod.reduce((sum, o) => sum + o.total_price, 0);
  const avgOrderValue = total > 0 ? totalRevenue / total : 0;

  return { counts, total, inProgress, deliveryRate, cancelRate, totalRevenue, avgOrderValue };
}

function computeProductPerformance(ordersInPeriod: OrderRow[], topN = 10) {
  const byProduct = new Map<string, { product_code: string; revenue: number; qty: number; lines: number }>();
  for (const o of ordersInPeriod) {
    const key = o.product_code || "—";
    const prev = byProduct.get(key) ?? { product_code: key, revenue: 0, qty: 0, lines: 0 };
    prev.revenue += o.total_price;
    prev.qty += o.qty;
    prev.lines += 1;
    byProduct.set(key, prev);
  }

  const rows = Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue).slice(0, topN);
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);
  return { rows, maxRevenue };
}

function normalizeQueryText(input: string) {
  return input.trim().toLowerCase();
}

export default async function OrdersDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    q?: string;
    status?: string;
    sort?: string;
    dir?: string;
    from?: string;
    to?: string;
  }>;
}) {
  if (!(await isDashboardAuthed())) {
    redirect("/dashboard/login");
  }

  const params = await searchParams;
  const period = (params.period as Period) || "today";
  const q = typeof params.q === "string" ? params.q : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const sortKey = typeof params.sort === "string" ? params.sort : "date";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  let allOrders: OrderRow[] = [];
  let chartSeries: RevenueChartSeries = { days: [], weeks: [], months: [] };
  let ordersError: string | null = null;
  try {
    const [fetchedOrders, fetchedSeries] = await Promise.all([
      getOrders(),
      getRevenueChartSeries(),
    ]);
    allOrders = fetchedOrders;
    chartSeries = fetchedSeries;
  } catch (e) {
    ordersError = e instanceof Error ? e.message : "Erreur de chargement des commandes";
  }

  const ordersInPeriod = filterOrdersByTimeWindow(allOrders, { period, from: from || undefined, to: to || undefined });

  const kpis = computeOrderKpis(ordersInPeriod);
  const productPerf = computeProductPerformance(ordersInPeriod, 10);

  const qNorm = normalizeQueryText(q);
  const statusAllowed = new Set<OrderStatus>(["new", "confirmed", "shipped", "delivered", "cancelled"]);

  const tableOrders = ordersInPeriod
    .filter((o) => {
      if (statusFilter && statusAllowed.has(statusFilter as OrderStatus)) {
        if (o.status !== (statusFilter as OrderStatus)) return false;
      }
      if (!qNorm) return true;
      const hay = [
        o.product_code,
        o.city,
        o.phone,
        o.name ?? "",
        o.notes ?? "",
        o.size,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(qNorm);
    })
    .sort((a, b) => {
      const dirMul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "total") return dirMul * (a.total_price - b.total_price);
      if (sortKey === "city") return dirMul * a.city.localeCompare(b.city);
      if (sortKey === "status") return dirMul * a.status.localeCompare(b.status);
      // default: date
      return dirMul * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

  const totalQty = ordersInPeriod.reduce((sum, o) => sum + o.qty, 0);
  const cities = new Set(ordersInPeriod.map((o) => o.city)).size;

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

        {ordersError ? (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">Impossible de charger les commandes</p>
            <p className="mt-1 text-xs text-amber-200/80">{ordersError}</p>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <StatCard label="Commandes" value={ordersInPeriod.length} sub={getPeriodLabel(period)} accent="text-white" />
          <StatCard label="Chiffre d'affaires" value={`${kpis.totalRevenue.toLocaleString()} DH`} sub={getPeriodLabel(period)} accent="text-emerald-400" />
          <StatCard label="Articles vendus" value={totalQty} sub="Total paires" />
          <StatCard label="Villes" value={cities} sub="Villes distinctes" />
        </div>

        {/* Revenue chart */}
        <div className="mb-8">
          <RevenueChart series={chartSeries} />
        </div>

        {/* KPIs + Top products */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Indicateurs par période</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Basés sur la période (sans recherche/statut du tableau)</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Panier moyen</p>
                <p className="text-sm font-bold text-white">{Math.round(kpis.avgOrderValue).toLocaleString()} DH</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Nouveau" value={kpis.counts.new} />
              <StatCard label="Confirmé" value={kpis.counts.confirmed} />
              <StatCard label="Expédié" value={kpis.counts.shipped} />
              <StatCard label="Livré" value={kpis.counts.delivered} accent="text-emerald-400" />
              <StatCard label="Annulé" value={kpis.counts.cancelled} accent="text-red-300" />
              <StatCard label="En cours" value={kpis.inProgress} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">Taux livraison</p>
                <p className="text-sm font-bold text-white">{Math.round(kpis.deliveryRate * 100)}%</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">Taux annulation</p>
                <p className="text-sm font-bold text-white">{Math.round(kpis.cancelRate * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Performance produits</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Top 10 par chiffre d'affaires</p>
              </div>
            </div>

            {productPerf.rows.length === 0 ? (
              <p className="text-xs text-zinc-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2">
                {productPerf.rows.map((p) => {
                  const pct = (p.revenue / productPerf.maxRevenue) * 100;
                  return (
                    <div key={p.product_code} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-white truncate">{p.product_code}</p>
                        <p className="text-xs font-bold text-emerald-300 whitespace-nowrap">{p.revenue.toLocaleString()} DH</p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-600/80" style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{p.lines} cmd</span>
                        <span>{p.qty} qt</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <form method="get" className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="period" value={period} />
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Recherche</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Produit, ville, téléphone, nom…"
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>

            <div className="min-w-[190px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Statut</label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-200 outline-none hover:border-zinc-600"
              >
                <option value="">Tous</option>
                <option value="new">Nouveau</option>
                <option value="confirmed">Confirmé</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div className="min-w-[190px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Tri</label>
              <select
                name="sort"
                defaultValue={sortKey}
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-200 outline-none hover:border-zinc-600"
              >
                <option value="date">Date</option>
                <option value="total">Total</option>
                <option value="city">Ville</option>
                <option value="status">Statut</option>
              </select>
            </div>

            <div className="min-w-[140px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Direction</label>
              <select
                name="dir"
                defaultValue={sortDir}
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-200 outline-none hover:border-zinc-600"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">De</label>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <div className="min-w-[180px]">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">À</label>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="h-9 w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500"
              >
                Appliquer
              </button>
              <a
                href={`/dashboard/orders?period=${period}`}
                className="h-9 inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
              >
                Réinitialiser
              </a>
            </div>
          </div>
        </form>

        {/* Table header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Liste des commandes{" "}
            <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {tableOrders.length}
            </span>
          </h3>
          <ExportCsvButton orders={tableOrders} />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {tableOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-sm text-zinc-500">
              Aucune commande {period !== "all" ? getPeriodLabel(period) : ""}.
            </div>
          ) : (
            tableOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
                    <p className="mt-1 text-sm font-bold text-white truncate">{order.product_code}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      EU {order.size} · {order.qty} · {order.city}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">{order.total_price} DH</p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <p className="text-xs text-zinc-400 font-mono">{order.phone}</p>
                  <p className="text-xs text-zinc-400">{order.name ?? <span className="text-zinc-600">—</span>}</p>
                  <p className="text-xs text-zinc-500">{order.notes ?? <span className="text-zinc-700">—</span>}</p>
                </div>

                <div className="mt-3">
                  <OrderRowActions
                    orderId={order.id}
                    phone={order.phone}
                    initialStatus={order.status}
                    initialNotes={order.notes}
                    productCode={order.product_code}
                    city={order.city}
                    size={order.size}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  {[
                    "Date",
                    "Produit",
                    "Pointure",
                    "Qté",
                    "Ville",
                    "Téléphone",
                    "Nom",
                    "Notes",
                    "Total",
                    "Actions",
                  ].map((h) => (
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
                {tableOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-zinc-600">
                      Aucune commande {period !== "all" ? getPeriodLabel(period) : ""}.
                    </td>
                  </tr>
                ) : (
                  tableOrders.map((order: OrderRow, i: number) => (
                    <tr
                      key={order.id}
                      className={`border-b border-zinc-800/60 align-top transition-colors hover:bg-zinc-800/30 ${
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
                      <td className="px-4 py-3 text-zinc-300">{order.city}</td>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{order.phone}</td>
                      <td className="px-4 py-3 text-zinc-400">{order.name ?? <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-3 max-w-[240px] truncate text-zinc-500 text-xs" title={order.notes ?? ""}>
                        {order.notes ?? <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400 whitespace-nowrap">
                        {order.total_price} DH
                      </td>
                      <td className="px-4 py-3 min-w-[280px]">
                        <OrderRowActions
                          orderId={order.id}
                          phone={order.phone}
                          initialStatus={order.status}
                          initialNotes={order.notes}
                          productCode={order.product_code}
                          city={order.city}
                          size={order.size}
                        />
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