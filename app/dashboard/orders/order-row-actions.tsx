"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_OPTIONS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Nouveau" },
  { key: "confirmed", label: "Confirmé" },
  { key: "shipped", label: "Expédié" },
  { key: "delivered", label: "Livré" },
  { key: "cancelled", label: "Annulé" },
];

function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

export function OrderRowActions({
  orderId,
  phone,
  initialStatus,
  initialNotes,
  productCode,
  city,
  size,
}: {
  orderId: number;
  phone: string;
  initialStatus: OrderStatus;
  initialNotes: string | null;
  productCode: string;
  city: string;
  size: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const waHref = useMemo(() => {
    const num = digitsOnly(phone);
    const text = encodeURIComponent(
      `Bonjour, concernant votre commande ${productCode} (EU ${size}) à ${city}.`
    );
    return `https://wa.me/${num}?text=${text}`;
  }, [phone, productCode, city, size]);

  async function patch(body: Record<string, unknown>) {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }
      if (Object.prototype.hasOwnProperty.call(body, "notes")) {
        setSavedNotes(String(body.notes ?? ""));
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError("Impossible d’enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // ignore
    }
  }

  function saveNotesIfChanged() {
    const next = notes.trim();
    const prev = savedNotes.trim();
    if (next === prev || saving || isPending) return;
    void patch({ notes: next });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as OrderStatus;
            setStatus(next);
            void patch({ status: next });
          }}
          disabled={saving || isPending}
          className="h-8 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 text-xs font-semibold text-zinc-200 outline-none hover:border-zinc-600"
          aria-label="Statut"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={copyPhone}
          className="h-8 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700"
        >
          Copier tél
        </button>

        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-300/20 bg-gradient-to-b from-[#2eea7a] to-[#1fb95b] px-3 text-xs font-bold text-[#062b14] shadow-[0_6px_18px_rgba(37,211,102,0.32)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(37,211,102,0.4)] active:translate-y-0"
          aria-label="Ouvrir WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.52 0 .2 5.32.2 11.86c0 2.1.56 4.16 1.62 5.97L0 24l6.35-1.66a11.84 11.84 0 0 0 5.71 1.46h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.14-3.41-8.46ZM12.07 21.8h-.01a9.9 9.9 0 0 1-5.04-1.37l-.36-.22-3.77.99 1.01-3.67-.24-.38A9.83 9.83 0 0 1 2.14 11.86c0-5.48 4.46-9.94 9.94-9.94 2.65 0 5.14 1.03 7.02 2.92a9.86 9.86 0 0 1 2.9 7.02c0 5.48-4.46 9.94-9.93 9.94Zm5.45-7.46c-.3-.15-1.79-.88-2.07-.98-.28-.1-.49-.15-.69.15s-.79.98-.96 1.18c-.18.2-.35.22-.65.08-.3-.15-1.24-.46-2.36-1.47-.87-.77-1.45-1.72-1.62-2.02-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.69-1.67-.95-2.3-.25-.6-.5-.52-.69-.52h-.59c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.52 0 1.48 1.08 2.91 1.23 3.11.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.79-.73 2.04-1.44.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z" />
          </svg>
          WA
        </a>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotesIfChanged}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          placeholder="Notes internes…"
          className="h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

