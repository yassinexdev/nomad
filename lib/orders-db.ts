import { neon } from "@neondatabase/serverless";

export type NewOrder = {
  productCode: string;
  size: string;
  qty: number;
  city: string;
  phone: string;
  name?: string;
  notes?: string;
  locale: string;
  unitPrice: number;
  totalPrice: number;
};

export type OrderRow = {
  id: number;
  product_code: string;
  size: string;
  qty: number;
  city: string;
  phone: string;
  name: string | null;
  notes: string | null;
  locale: string;
  unit_price: number;
  total_price: number;
  created_at: string;
};

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(databaseUrl);
}

async function ensureOrdersTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      product_code TEXT NOT NULL,
      size TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK (qty > 0),
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      name TEXT,
      notes TEXT,
      locale TEXT NOT NULL,
      unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
      total_price INTEGER NOT NULL CHECK (total_price >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function createOrder(order: NewOrder) {
  await ensureOrdersTable();
  const sql = getDb();

  await sql`
    INSERT INTO orders (
      product_code, size, qty, city, phone, name, notes, locale, unit_price, total_price
    )
    VALUES (
      ${order.productCode},
      ${order.size},
      ${order.qty},
      ${order.city},
      ${order.phone},
      ${order.name ?? null},
      ${order.notes ?? null},
      ${order.locale},
      ${order.unitPrice},
      ${order.totalPrice}
    )
  `;
}

export async function getOrders(): Promise<OrderRow[]> {
  await ensureOrdersTable();
  const sql = getDb();

  const rows = (await sql`
    SELECT
      id,
      product_code,
      size,
      qty,
      city,
      phone,
      name,
      notes,
      locale,
      unit_price,
      total_price,
      created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 200
  `) as OrderRow[];

  return rows;
}
