"use client";

import type { OrderRow } from "@/lib/orders-db";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDateForCsv(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function ordersToCsv(orders: OrderRow[]): string {
  const headers = [
    "Date",
    "Produit",
    "Pointure",
    "Quantité",
    "Ville",
    "Téléphone",
    "Nom",
    "Notes",
    "Prix unitaire",
    "Total",
    "Langue",
  ];

  const rows = orders.map((o) => [
    escapeCsv(formatDateForCsv(o.created_at)),
    escapeCsv(o.product_code),
    escapeCsv(o.size),
    String(o.qty),
    escapeCsv(o.city),
    escapeCsv(o.phone),
    escapeCsv(o.name ?? ""),
    escapeCsv(o.notes ?? ""),
    String(o.unit_price),
    String(o.total_price),
    escapeCsv(o.locale),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function ExportCsvButton({ orders }: { orders: OrderRow[] }) {
  function handleExport() {
    const csv = ordersToCsv(orders);
    // Add BOM for Excel to detect UTF-8
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    a.download = `commandes-zed-market-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      disabled={orders.length === 0}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Exporter CSV
    </button>
  );
}
