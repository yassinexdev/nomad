import { isDashboardAuthed } from "@/lib/dashboard-auth";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(databaseUrl);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isDashboardAuthed())) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return jsonError("Invalid order id", 400);
  }

  let payload: unknown;
  try {
    payload = await _request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const status = typeof (payload as any)?.status === "string" ? String((payload as any).status) : undefined;
  const notes = typeof (payload as any)?.notes === "string" ? String((payload as any).notes) : undefined;

  const allowed = new Set(["new", "confirmed", "shipped", "delivered", "cancelled"]);
  if (status !== undefined && !allowed.has(status)) {
    return jsonError("Invalid status", 400);
  }

  if (status === undefined && notes === undefined) {
    return jsonError("Nothing to update", 400);
  }

  try {
    const sql = getDb();
    await sql`
      UPDATE orders
      SET
        status = COALESCE(${status ?? null}, status),
        notes = COALESCE(${notes ?? null}, notes),
        updated_at = NOW()
      WHERE id = ${orderId}
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Dashboard order update failed:", error);
    return jsonError("Failed to update order", 500);
  }
}

