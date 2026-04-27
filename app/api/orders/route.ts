import { createOrder } from "@/lib/orders-db";
import { sendOrderNotification } from "@/lib/order-notifications";
import { NextResponse } from "next/server";

function digitsOnlyPhone(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const productCode = String(payload?.productCode ?? "").trim();
    const size = String(payload?.size ?? "").trim();
    const qty = Number(payload?.qty ?? 0);
    const city = String(payload?.city ?? "").trim();
    const phone = digitsOnlyPhone(String(payload?.phone ?? "").trim());
    const name = String(payload?.name ?? "").trim();
    const notes = String(payload?.notes ?? "").trim();
    const locale = String(payload?.locale ?? "").trim() || "fr";
    const unitPrice = Number(payload?.unitPrice ?? 0);
    const totalPrice = Number(payload?.totalPrice ?? 0);

    if (!productCode || !size || !city || !phone || qty <= 0) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    const order = {
      productCode,
      size,
      qty,
      city,
      phone,
      name: name || undefined,
      notes: notes || undefined,
      locale,
      unitPrice,
      totalPrice,
    };

    try {
      await createOrder(order);
    } catch (error) {
      console.error("Order database save failed (DATABASE_URL may be missing):", error);
    }

    try {
      await sendOrderNotification(order);
    } catch (error) {
      console.error("Order notification failed", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
