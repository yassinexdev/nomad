import nodemailer from "nodemailer";
import type { NewOrder } from "@/lib/orders-db";

function buildEmailHtml(order: NewOrder): string {
  const now = new Date().toLocaleString("fr-MA", {
    timeZone: "Africa/Casablanca",
    dateStyle: "full",
    timeStyle: "short",
  });

  // ── Color variant helpers ───────────────────────────────────────────────────
  // Maps the stored color id → { hex, label }. Extend as new variants are added.
  const COLOR_META: Record<string, { hex: string; label: string }> = {
    rouge:  { hex: "#DC2626", label: "Rouge" },
    jaune:  { hex: "#EAB308", label: "Jaune" },
    noir:   { hex: "#18181B", label: "Noir" },
    blanc:  { hex: "#F4F4F5", label: "Blanc" },
    bleu:   { hex: "#2563EB", label: "Bleu" },
    vert:   { hex: "#16A34A", label: "Vert" },
    rose:   { hex: "#EC4899", label: "Rose" },
    orange: { hex: "#EA580C", label: "Orange" },
  };

  const colorMeta = order.color
    ? (COLOR_META[order.color.toLowerCase()] ?? { hex: "#6B7280", label: order.color })
    : null;

  // ── Build table rows ────────────────────────────────────────────────────────
  const staticRows: [string, string][] = [
    ["🛍️ Produit",       order.productCode],
    ["📐 Taille",        order.size],
    ["🔢 Quantité",      String(order.qty)],
    ["🏙️ Ville",         order.city],
    ["📞 Téléphone",     order.phone],
    ["👤 Nom",           order.name || "—"],
    ["📝 Notes",         order.notes || "—"],
    ["🌍 Langue",        order.locale.toUpperCase()],
    ["💰 Prix unitaire", `${order.unitPrice} DH`],
    ["💵 Total",         `${order.totalPrice} DH`],
  ];

  // Render a standard text row
  function renderRow(label: string, value: string) {
    return `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#374151;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${label}</td>
        <td style="padding:10px 16px;color:#111827;border-bottom:1px solid #e5e7eb;">${value}</td>
      </tr>`;
  }

  // Render the special color swatch row (only when color is present)
  function renderColorRow(meta: { hex: string; label: string }) {
    return `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#374151;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">🎨 Couleur</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">
          <span style="display:inline-flex;align-items:center;gap:8px;">
            <span style="
              display:inline-block;
              width:18px;height:18px;
              border-radius:50%;
              background:${meta.hex};
              border:2px solid rgba(0,0,0,0.12);
              vertical-align:middle;
              flex-shrink:0;
            "></span>
            <span style="color:#111827;font-weight:600;">${meta.label}</span>
          </span>
        </td>
      </tr>`;
  }

  // Insert colour row right after the product row (index 0)
  const allRows: string[] = [];
  staticRows.forEach(([label, value], idx) => {
    allRows.push(renderRow(label, value));
    if (idx === 0 && colorMeta) {
      allRows.push(renderColorRow(colorMeta));
    }
  });

  const tableRows = allRows.join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🛒 Nouvelle Commande</h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">${now}</p>
          </td>
        </tr>
        <!-- Badge -->
        <tr>
          <td style="padding:24px 40px 0;text-align:center;">
            <span style="display:inline-block;background:#dcfce7;color:#15803d;padding:6px 20px;border-radius:99px;font-size:13px;font-weight:600;letter-spacing:0.3px;">✅ Commande reçue avec succès</span>
          </td>
        </tr>
        <!-- Order details table -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
              ${tableRows}
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Notification automatique — ZAK Store</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText(order: NewOrder): string {
  const lines = [
    "=== NOUVELLE COMMANDE ===",
    `Produit : ${order.productCode}`,
  ];
  if (order.color) {
    lines.push(`Couleur : ${order.color}`);
  }
  lines.push(
    `Taille  : ${order.size}`,
    `Quantité: ${order.qty}`,
    `Ville   : ${order.city}`,
    `Tél     : ${order.phone}`,
    `Nom     : ${order.name || "—"}`,
    `Notes   : ${order.notes || "—"}`,
    `Langue  : ${order.locale.toUpperCase()}`,
    `Total   : ${order.totalPrice} DH`,
  );
  return lines.join("\n");
}

export async function sendOrderNotification(order: NewOrder) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const notifyTo = process.env.NOTIFY_EMAIL || gmailUser;

  // Silently skip if Gmail is not configured
  if (!gmailUser || !gmailPass) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  await transporter.sendMail({
    from: `"ZAK Store 🛒" <${gmailUser}>`,
    to: notifyTo,
    subject: `🛒 Nouvelle commande — ${order.productCode} | ${order.totalPrice} DH`,
    text: buildEmailText(order),
    html: buildEmailHtml(order),
  });
}
