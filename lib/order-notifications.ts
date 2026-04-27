import type { NewOrder } from "@/lib/orders-db";

function buildOrderMessage(order: NewOrder) {
  return [
    "New order received",
    `Product: ${order.productCode}`,
    `Size: ${order.size}`,
    `Qty: ${order.qty}`,
    `City: ${order.city}`,
    `Phone: ${order.phone}`,
    `Name: ${order.name || "-"}`,
    `Notes: ${order.notes || "-"}`,
    `Locale: ${order.locale}`,
    `Total: ${order.totalPrice} DH`,
  ].join("\n");
}

export async function sendOrderNotification(order: NewOrder) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  const text = buildOrderMessage(order);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send Telegram notification");
  }
}
