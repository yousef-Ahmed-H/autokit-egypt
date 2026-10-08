import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listAuditLogs } from "@/lib/admin/audit";
import { getDashboardStats } from "@/lib/admin/stats";
import { listReturns } from "@/lib/returns/store";
import { listOrders } from "@/lib/orders/store";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import { formatNumber, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "التقارير" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePermission("reports.view");
  const [stats, returns, orders, products, logs] = await Promise.all([
    getDashboardStats(),
    listReturns(),
    listOrders(),
    getMergedProducts(),
    listAuditLogs(),
  ]);

  const revenue = stats.totalSales;
  const avgAov = stats.averageOrderValue;

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">النظام</p>
        <h1 className="h-section">التقارير</h1>
      </header>

      <section className="card grid gap-3 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-ink-400">إجمالي الطلبات</p>
          <p className="text-2xl font-extrabold">{formatNumber(orders.length)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">إجمالي المبيعات (صافي)</p>
          <p className="text-2xl font-extrabold">{formatPrice(revenue)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">متوسط قيمة الطلب</p>
          <p className="text-2xl font-extrabold">{formatPrice(avgAov)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400">عدد المرتجعات</p>
          <p className="text-2xl font-extrabold">{formatNumber(returns.length)}</p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">منتجات منخفضة المخزون ({formatNumber(stats.lowStock.length)})</h2>
          <ul className="mt-2 divide-y divide-ink-100 text-sm">
            {stats.lowStock.map((item) => (
              <li key={item.slug} className="flex items-center justify-between py-1.5">
                <span>{item.name}</span>
                <span className="font-bold text-red-600">{item.stock}/{item.minStock}</span>
              </li>
            ))}
            {stats.lowStock.length === 0 && <p className="text-ink-500">لا توجد منتجات منخفضة المخزون.</p>}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">آخر الأحداث ({formatNumber(logs.length)})</h2>
          <ul className="mt-2 divide-y divide-ink-100 text-sm">
            {logs.slice(0, 12).map((l) => (
              <li key={l.id} className="py-1.5">
                <span className="text-ink-400" dir="ltr">{l.at.slice(0, 16).replace("T", " ")}</span> — {l.summary}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}