import { neon } from "@neondatabase/serverless";

export type NewOrder = {
  productCode: string;
  size: string;
  qty: number;
  city: string;
  phone: string;
  name?: string;
  notes?: string;
  status?: OrderStatus;
  locale: string;
  unitPrice: number;
  totalPrice: number;
};

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderRow = {
  id: number;
  product_code: string;
  size: string;
  qty: number;
  city: string;
  phone: string;
  name: string | null;
  notes: string | null;
  status: OrderStatus;
  locale: string;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
};

export type OrdersQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: OrderStatus | "";
  sort?: "date" | "total" | "city" | "status";
  dir?: "asc" | "desc";
  from?: string;
  to?: string;
};

export type OrdersPage = {
  rows: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OrdersKpis = {
  counts: Record<OrderStatus, number>;
  total: number;
  inProgress: number;
  deliveryRate: number;
  cancelRate: number;
  totalRevenue: number;
  avgOrderValue: number;
};

export type ProductPerformanceRow = {
  product_code: string;
  revenue: number;
  qty: number;
  lines: number;
};

export type RevenueChartPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type RevenueChartSeries = {
  days: RevenueChartPoint[];
  weeks: RevenueChartPoint[];
  months: RevenueChartPoint[];
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
      status TEXT NOT NULL DEFAULT 'new',
      locale TEXT NOT NULL,
      unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
      total_price INTEGER NOT NULL CHECK (total_price >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Backwards-compatible migrations for existing deployments.
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
}

export async function createOrder(order: NewOrder) {
  await ensureOrdersTable();
  const sql = getDb();

  await sql`
    INSERT INTO orders (
      product_code, size, qty, city, phone, name, notes, status, locale, unit_price, total_price
    )
    VALUES (
      ${order.productCode},
      ${order.size},
      ${order.qty},
      ${order.city},
      ${order.phone},
      ${order.name ?? null},
      ${order.notes ?? null},
      ${order.status ?? "new"},
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
      status,
      locale,
      unit_price,
      total_price,
      created_at,
      updated_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 200
  `) as OrderRow[];

  return rows;
}

function parseYmdToIsoStart(ymd?: string) {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`;
}

function parseYmdToIsoEnd(ymd?: string) {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T23:59:59.999Z`;
}

function normalizeQuery(query: OrdersQuery) {
  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
  const page = Math.max(query.page ?? 1, 1);
  const sort = query.sort ?? "date";
  const dir = query.dir === "asc" ? "asc" : "desc";
  const q = query.q?.trim() ?? "";
  const status = query.status ?? "";
  const fromIso = parseYmdToIsoStart(query.from);
  const toIso = parseYmdToIsoEnd(query.to);
  return { pageSize, page, sort, dir, q, status, fromIso, toIso };
}

function buildOrdersWhere(query: ReturnType<typeof normalizeQuery>, options?: { includeSearch?: boolean; includeStatus?: boolean }) {
  const params: unknown[] = [];
  const clauses: string[] = [];
  const includeSearch = options?.includeSearch ?? true;
  const includeStatus = options?.includeStatus ?? true;

  if (query.fromIso) {
    params.push(query.fromIso);
    clauses.push(`created_at >= $${params.length}`);
  }

  if (query.toIso) {
    params.push(query.toIso);
    clauses.push(`created_at <= $${params.length}`);
  }

  if (includeStatus && query.status) {
    params.push(query.status);
    clauses.push(`status = $${params.length}`);
  }

  if (includeSearch && query.q) {
    params.push(`%${query.q}%`);
    const searchParam = `$${params.length}`;
    clauses.push(`(
      product_code ILIKE ${searchParam}
      OR city ILIKE ${searchParam}
      OR phone ILIKE ${searchParam}
      OR COALESCE(name, '') ILIKE ${searchParam}
      OR COALESCE(notes, '') ILIKE ${searchParam}
      OR size ILIKE ${searchParam}
    )`);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function getOrderByClause(query: ReturnType<typeof normalizeQuery>) {
  const column =
    query.sort === "total"
      ? "total_price"
      : query.sort === "city"
        ? "city"
        : query.sort === "status"
          ? "status"
          : "created_at";
  const direction = query.dir === "asc" ? "ASC" : "DESC";
  return `ORDER BY ${column} ${direction}`;
}

export async function getOrdersPage(query: OrdersQuery = {}): Promise<OrdersPage> {
  await ensureOrdersTable();
  const sql = getDb();
  const normalized = normalizeQuery(query);
  const { whereSql, params } = buildOrdersWhere(normalized);
  const countRows = (await sql.query(
    `SELECT COUNT(*)::int AS total FROM orders ${whereSql}`,
    params as any[],
  )) as Array<{ total: number }>;
  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / normalized.pageSize), 1);
  const safePage = Math.min(normalized.page, totalPages);
  const offset = (safePage - 1) * normalized.pageSize;

  const rows = (await sql.query(
    `
      SELECT
        id,
        product_code,
        size,
        qty,
        city,
        phone,
        name,
        notes,
        status,
        locale,
        unit_price,
        total_price,
        created_at,
        updated_at
      FROM orders
      ${whereSql}
      ${getOrderByClause(normalized)}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
    [...params, normalized.pageSize, offset] as any[],
  )) as OrderRow[];

  return {
    rows,
    total,
    page: safePage,
    pageSize: normalized.pageSize,
    totalPages,
  };
}

export async function getOrdersKpis(query: Pick<OrdersQuery, "from" | "to"> = {}): Promise<OrdersKpis> {
  await ensureOrdersTable();
  const sql = getDb();
  const normalized = normalizeQuery(query);
  const { whereSql, params } = buildOrdersWhere(normalized, { includeSearch: false, includeStatus: false });
  const rows = (await sql.query(
    `
      SELECT
        COALESCE(COUNT(*), 0)::int AS total,
        COALESCE(SUM(total_price), 0)::int AS total_revenue,
        COALESCE(SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END), 0)::int AS count_new,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0)::int AS count_confirmed,
        COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0)::int AS count_shipped,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0)::int AS count_delivered,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0)::int AS count_cancelled
      FROM orders
      ${whereSql}
    `,
    params as any[],
  )) as Array<{
    total: number;
    total_revenue: number;
    count_new: number;
    count_confirmed: number;
    count_shipped: number;
    count_delivered: number;
    count_cancelled: number;
  }>;

  const first = rows[0] ?? {
    total: 0,
    total_revenue: 0,
    count_new: 0,
    count_confirmed: 0,
    count_shipped: 0,
    count_delivered: 0,
    count_cancelled: 0,
  };

  const counts: Record<OrderStatus, number> = {
    new: first.count_new,
    confirmed: first.count_confirmed,
    shipped: first.count_shipped,
    delivered: first.count_delivered,
    cancelled: first.count_cancelled,
  };

  const total = first.total;
  const inProgress = counts.new + counts.confirmed + counts.shipped;
  const nonCancelled = total - counts.cancelled;
  const totalRevenue = first.total_revenue;

  return {
    counts,
    total,
    inProgress,
    deliveryRate: nonCancelled > 0 ? counts.delivered / nonCancelled : 0,
    cancelRate: total > 0 ? counts.cancelled / total : 0,
    totalRevenue,
    avgOrderValue: total > 0 ? totalRevenue / total : 0,
  };
}

export async function getTopProducts(query: Pick<OrdersQuery, "from" | "to"> = {}, topN = 10): Promise<ProductPerformanceRow[]> {
  await ensureOrdersTable();
  const sql = getDb();
  const normalized = normalizeQuery(query);
  const { whereSql, params } = buildOrdersWhere(normalized, { includeSearch: false, includeStatus: false });
  const limit = Math.min(Math.max(topN, 1), 50);
  return (await sql.query(
    `
      SELECT
        COALESCE(product_code, '—') AS product_code,
        COALESCE(SUM(total_price), 0)::int AS revenue,
        COALESCE(SUM(qty), 0)::int AS qty,
        COUNT(*)::int AS lines
      FROM orders
      ${whereSql}
      GROUP BY product_code
      ORDER BY revenue DESC
      LIMIT $${params.length + 1}
    `,
    [...params, limit] as any[],
  )) as ProductPerformanceRow[];
}

function formatDayLabel(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

function formatMonthLabel(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    month: "short",
    year: "2-digit",
  }).format(d);
}

function startOfWeekMonday(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const day = out.getDay();
  const diff = day === 0 ? 6 : day - 1;
  out.setDate(out.getDate() - diff);
  return out;
}

function getYearWeekKey(d: Date) {
  const start = startOfWeekMonday(d);
  const year = start.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const week1 = startOfWeekMonday(jan4);
  const week = Math.floor((start.getTime() - week1.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export async function getRevenueChartSeries(): Promise<RevenueChartSeries> {
  await ensureOrdersTable();
  const sql = getDb();
  const dailyRows = (await sql.query(
    `
      SELECT
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS bucket,
        COALESCE(SUM(total_price), 0)::int AS revenue,
        COUNT(*)::int AS orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '29 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `,
  )) as Array<{ bucket: string; revenue: number; orders: number }>;

  const monthlyRows = (await sql.query(
    `
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket,
        COALESCE(SUM(total_price), 0)::int AS revenue,
        COUNT(*)::int AS orders
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `,
  )) as Array<{ bucket: string; revenue: number; orders: number }>;

  const weeklySourceRows = (await sql.query(
    `
      SELECT
        DATE(created_at) AS day_bucket,
        COALESCE(SUM(total_price), 0)::int AS revenue,
        COUNT(*)::int AS orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '83 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `,
  )) as Array<{ day_bucket: string; revenue: number; orders: number }>;

  const dailyMap = new Map(dailyRows.map((r) => [r.bucket, { revenue: r.revenue, orders: r.orders }]));
  const monthlyMap = new Map(monthlyRows.map((r) => [r.bucket, { revenue: r.revenue, orders: r.orders }]));

  const weeklyMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of weeklySourceRows) {
    const key = getYearWeekKey(new Date(row.day_bucket));
    const prev = weeklyMap.get(key) ?? { revenue: 0, orders: 0 };
    prev.revenue += row.revenue;
    prev.orders += row.orders;
    weeklyMap.set(key, prev);
  }

  const now = new Date();

  const days: RevenueChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const agg = dailyMap.get(key);
    days.push({
      label: formatDayLabel(d),
      revenue: agg?.revenue ?? 0,
      orders: agg?.orders ?? 0,
    });
  }

  const weeks: RevenueChartPoint[] = [];
  const currentWeekStart = startOfWeekMonday(now);
  for (let i = 11; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    const agg = weeklyMap.get(getYearWeekKey(ws));
    weeks.push({
      label: formatDayLabel(ws),
      revenue: agg?.revenue ?? 0,
      orders: agg?.orders ?? 0,
    });
  }

  const months: RevenueChartPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const agg = monthlyMap.get(key);
    months.push({
      label: formatMonthLabel(d),
      revenue: agg?.revenue ?? 0,
      orders: agg?.orders ?? 0,
    });
  }

  return { days, weeks, months };
}
