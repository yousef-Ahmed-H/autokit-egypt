import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Order } from "@/lib/orders/types";
import { IS_DEMO } from "@/lib/config";

/**
 * مخزن الطلبات المؤقت (بدون قاعدة بيانات بعد).
 * يُحفظ في ملف JSON داخل المشروع: `.data/orders.json`
 *
 * ⚠️ هذا حل مؤقت للتطوير/العرض فقط. عند ربط Supabase:
 *    استبدل جسم هذه الدوال باستعلامات على جدولي `orders` و`order_items`.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

/* سلسلة تنفيذ بسيطة لتفادي تعارض الكتابة عند تزامن الطلبات */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/* كاش في الذاكرة لتقليل قراءة الملف */
let cache: Order[] | null = null;

async function readAll(): Promise<Order[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Order[];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function writeAll(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  cache = orders;
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** رقم طلب فريد مثل AK-20261007-0001 (تسلسل يومي) */
export function buildOrderNumber(orders: Order[], date: Date): string {
  const prefix = `AK-${dateKey(date)}-`;
  const sameDay = orders.filter((o) => o.orderNumber.startsWith(prefix)).length;
  return `${prefix}${String(sameDay + 1).padStart(4, "0")}`;
}

export interface NewOrderInput {
  address: Order["address"];
  items: Order["items"];
  totals: Order["totals"];
  idempotencyKey?: string;
}

/**
 * إنشاء طلب جديد.
 * - نفس `idempotencyKey` = يعيد نفس الطلب ولا يُنشئ طلبًا آخر (منع التكرار).
 * - رقم الطلب تسلسلي لكل يوم.
 */
export function createOrder(input: NewOrderInput): Promise<Order> {
  return serialize(async () => {
    const orders = await readAll();

    if (input.idempotencyKey) {
      const existing = orders.find((o) => o.idempotencyKey === input.idempotencyKey);
      if (existing) return existing;
    }

    const now = new Date();
    const order: Order = {
      id: randomUUID(),
      orderNumber: buildOrderNumber(orders, now),
      status: "pending",
      paymentMethod: "cod",
      items: input.items,
      totals: input.totals,
      address: input.address,
      idempotencyKey: input.idempotencyKey,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      demo: IS_DEMO,
    };

    await writeAll([...orders, order]);
    return order;
  });
}

export function listOrders(): Promise<Order[]> {
  return serialize(async () => [...(await readAll())]);
}

export function findOrderByNumber(orderNumber: string): Promise<Order | null> {
  return serialize(async () => {
    const orders = await readAll();
    const normalized = orderNumber.trim().toUpperCase();
    return orders.find((o) => o.orderNumber.toUpperCase() === normalized) ?? null;
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** مطابقة الهاتف (الأساسي أو الإضافي) — يقبل آخر 4 أرقام */
function matchesPhone(order: Order, phone: string): boolean {
  const input = normalizePhone(phone);
  if (!input) return false;
  const candidates = [order.address.phone, order.address.phone2]
    .filter(Boolean)
    .map((p) => normalizePhone(String(p)));
  return candidates.some((c) => c === input || (input.length >= 4 && c.slice(-4) === input.slice(-4)));
}

/** تتبع الطلب: يحتاج رقم الطلب + رقم الهاتف */
export function findOrderForTracking(orderNumber: string, phone: string): Promise<Order | null> {
  return serialize(async () => {
    const orders = await readAll();
    const normalized = orderNumber.trim().toUpperCase();
    const order = orders.find((o) => o.orderNumber.toUpperCase() === normalized);
    if (!order) return null;
    return matchesPhone(order, phone) ? order : null;
  });
}

/** الوصول المباشر بعد إنشاء الطلب (صفحة النجاح) — بدون تحقق هاتف */
export function findOrderDirect(orderNumber: string): Promise<Order | null> {
  return findOrderByNumber(orderNumber);
}

/** تحديث حالة الطلب (من لوحة التحكم) */
export function updateOrderStatus(orderNumber: string, status: Order["status"]): Promise<Order | null> {
  return serialize(async () => {
    const orders = await readAll();
    const normalized = orderNumber.trim().toUpperCase();
    let updated: Order | null = null;
    const next = orders.map((o) => {
      if (o.orderNumber.toUpperCase() !== normalized) return o;
      updated = { ...o, status, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) await writeAll(next);
    return updated;
  });
}

/** تحديث حقول إدارية على الطلب (ملاحظات داخلية، رقم شحنة...) */
export function patchOrder(orderNumber: string, patch: Partial<Order>): Promise<Order | null> {
  return serialize(async () => {
    const orders = await readAll();
    const normalized = orderNumber.trim().toUpperCase();
    let updated: Order | null = null;
    const next = orders.map((o) => {
      if (o.orderNumber.toUpperCase() !== normalized) return o;
      updated = { ...o, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) await writeAll(next);
    return updated;
  });
}