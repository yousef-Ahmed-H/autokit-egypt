import type { AdminRole, AuditLog } from "@/lib/admin/types";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import { listAuditLogs } from "@/lib/admin/audit";
import { listOrders } from "@/lib/orders/store";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { listReturns } from "@/lib/returns/store";

/**
 * إحصائيات لوحة التحكم — تُحسب من المخزن الحالي.
 * عند ربط قاعدة البيانات تتحول إلى استعلامات مُجمَّعة (Views/RPC) مع فهارس.
 */

export interface BestSeller {
  name: string;
  slug: string;
  quantity: number;
}

export interface GovernorateStat {
  governorate: string;
  orders: number;
  total: number;
}

export interface LowStockItem {
  name: string;
  slug: string;
  stock: number;
  minStock: number;
}

export interface DashboardStats {
  newOrders: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  returnsCount: number;
  totalSales: number;
  averageOrderValue: number;
  totalOrders: number;
  lowStock: LowStockItem[];
  bestSellers: BestSeller[];
  salesByGovernorate: GovernorateStat[];
}

const SHIPPED_STATUSES: OrderStatus[] = ["handover", "on_the_way", "out_for_delivery"];

/** نستثني الملغى والمرتجع من أي إيراد */
function isBillable(order: Order): boolean {
  return order.status !== "cancelled" && order.status !== "returned";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, products, returns] = await Promise.all([
    listOrders(),
    getMergedProducts(),
    listReturns().catch(() => []),
  ]);

  const billable = orders.filter(isBillable);
  const totalSales = billable.reduce((sum, order) => sum + order.totals.total, 0);
  const averageOrderValue = billable.length > 0 ? Math.round(totalSales / billable.length) : 0;

  const lowStock: LowStockItem[] = products
    .filter((p) => p.status === "active" && p.stock <= p.minStock)
    .map((p) => ({ name: p.name, slug: p.slug, stock: p.stock, minStock: p.minStock }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  const qty = new Map<string, BestSeller>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const current = qty.get(item.slug) ?? { name: item.name, slug: item.slug, quantity: 0 };
      current.quantity += item.quantity;
      qty.set(item.slug, current);
    }
  }
  const bestSellers = [...qty.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const gov = new Map<string, GovernorateStat>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const key = order.address.governorate || "غير محدد";
    const current = gov.get(key) ?? { governorate: key, orders: 0, total: 0 };
    current.orders += 1;
    current.total += order.totals.total;
    gov.set(key, current);
  }
  const salesByGovernorate = [...gov.values()].sort((a, b) => b.total - a.total);

  return {
    newOrders: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length,
    shipped: orders.filter((o) => SHIPPED_STATUSES.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    returned: orders.filter((o) => o.status === "returned").length,
    returnsCount: returns.length,
    totalSales,
    averageOrderValue,
    totalOrders: orders.length,
    lowStock,
    bestSellers,
    salesByGovernorate,
  };
}

export interface ProfitStats {
  available: boolean;
  profit: number;
  revenue: number;
  costs: number;
  marginPct: number;
  missingCostProducts: string[];
}

/**
 * الأرباح — للمالك فقط (يُتحقق في الصفحة عبر reports.profit).
 * تُحسب من الطلبات «المسلَّمة» فقط. إن غابت تكلفة أي منتج تُعلَن النتيجة غير متاحة.
 */
export async function getProfitStats(): Promise<ProfitStats> {
  const [orders, products] = await Promise.all([listOrders(), getMergedProducts()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const missing = new Set<string>();
  let revenue = 0;
  let costs = 0;

  for (const order of orders) {
    if (order.status !== "delivered") continue;
    for (const item of order.items) {
      revenue += item.lineTotal;
      const product = bySlug.get(item.slug);
      if (!product || product.costPrice == null) {
        missing.add(item.name);
        continue;
      }
      costs += product.costPrice * item.quantity;
    }
  }

  const profit = revenue - costs;
  return {
    available: missing.size === 0,
    profit,
    revenue,
    costs,
    marginPct: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0,
    missingCostProducts: [...missing],
  };
}

/** آخر محاولات الدخول الفاشلة */
export async function getFailedLogins(): Promise<AuditLog[]> {
  const logs = await listAuditLogs();
  return logs.filter((log) => log.action === "login_failed");
}

/** هل يستطيع الدور رؤية الأرباح؟ (يُطابق الصلاحية reports.profit) */
export function canSeeProfit(role: AdminRole): boolean {
  return role === "owner";
}