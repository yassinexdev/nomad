import nodemailer from "nodemailer";
import type { NewOrder } from "@/lib/orders-db";

function buildEmailHtml(order: NewOrder): string {
  const now = new Date().toLocaleString("fr-MA", {
    timeZone: "Africa/Casablanca",
    dateStyle: "full",
    timeStyle: "short",
  });

  const rows = [
    ["🛍️ Produit", order.productCode],
    ["📐 Taille", order.size],
    ["🔢 Quantité", String(order.qty)],
    ["🏙️ Ville", order.city],
    ["📞 Téléphone", order.phone],
    ["👤 Nom", order.name || "—"],
    ["📝 Notes", order.notes || "—"],
    ["🌍 Langue", order.locale.toUpperCase()],
    ["💰 Prix unitaire", `${order.unitPrice} DH`],
    ["💵 Total", `${order.totalPrice} DH`],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#374151;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${label}</td>
        <td style="padding:10px 16px;color:#111827;border-bottom:1px solid #e5e7eb;">${value}</td>
      </tr>`
    )
    .join("");

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
  return [
    "=== NOUVELLE COMMANDE ===",
    `Produit : ${order.productCode}`,
    `Taille  : ${order.size}`,
    `Quantité: ${order.qty}`,
    `Ville   : ${order.city}`,
    `Tél     : ${order.phone}`,
    `Nom     : ${order.name || "—"}`,
    `Notes   : ${order.notes || "—"}`,
    `Langue  : ${order.locale.toUpperCase()}`,
    `Total   : ${order.totalPrice} DH`,
  ].join("\n");
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

