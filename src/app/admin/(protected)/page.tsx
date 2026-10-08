import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { canSeeProfit, getDashboardStats, getProfitStats } from "@/lib/admin/stats";
import { formatPrice, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "لوحة القيادة" };
export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-[0.72rem] font-bold text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-950">{value}</p>
      {hint && <p className="mt-1 text-[0.7rem] text-ink-400">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const admin = await requirePermission("dashboard.view");
  const params = await searchParams;
  const stats = await getDashboardStats();
  const profit = canSeeProfit(admin.role) ? await getProfitStats() : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">نظرة عامة</p>
          <h1 className="h-section">لوحة القيادة</h1>
          <p className="mt-1 text-sm text-ink-500">مرحبًا {admin.name} — ملخّص فوري لحالة المتجر.</p>
        </div>
        <Link href="/admin/orders" className="btn btn-outline">
          إدارة الطلبات
        </Link>
      </header>

      {params.denied && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          ليس لديك صلاحية للوصول إلى هذه الصفحة.
        </p>
      )}

      <section aria-label="ملخّص الطلبات" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="طلبات جديدة" value={formatNumber(stats.newOrders)} hint="في انتظار التأكيد" />
        <Stat label="مؤكدة/قيد التجهيز" value={formatNumber(stats.confirmed)} />
        <Stat label="تم تسليمها للشحن" value={formatNumber(stats.shipped)} hint="خارج المخزن" />
        <Stat label="تم التسليم" value={formatNumber(stats.delivered)} />
        <Stat label="إجمالي الطلبات" value={formatNumber(stats.totalOrders)} />
        <Stat label="إجمالي المبيعات" value={formatPrice(stats.totalSales)} hint="بدون الملغى والمرتجع" />
        <Stat label="متوسط قيمة الطلب" value={formatPrice(stats.averageOrderValue)} />
        <Stat label="مرتجعات" value={formatNumber(stats.returnsCount)} hint={`${formatNumber(stats.cancelled)} طلب ملغى`} />
      </section>

      {profit && (
        <section aria-label="الأرباح (للمالك)" className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">الأرباح (ملكي فقط)</h2>
          {profit.available ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Stat label="صافي الربح" value={formatPrice(profit.profit)} hint="من الطلبات المسلَّمة" />
              <Stat label="الإيراد" value={formatPrice(profit.revenue)} />
              <Stat label="هامش الربح" value={`${profit.marginPct}%`} />
            </div>
          ) : (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              الأرباح غير متاحة: يجب إدخال «سعر التكلفة» للمنتجات التالية أولًا:
              {" "}
              {profit.missingCostProducts.join("، ")}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-label="الأكثر مبيعًا" className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">الأكثر مبيعًا</h2>
          {stats.bestSellers.length === 0 ? (
            <p className="mt-2 text-sm text-ink-400">لا توجد مبيعات بعد.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">أعلى 5 منتجات مبيعًا حسب الكمية</caption>
              <thead>
                <tr className="text-start text-[0.72rem] text-ink-400">
                  <th scope="col" className="py-1 text-start">المنتج</th>
                  <th scope="col" className="py-1 text-end">الكمية</th>
                </tr>
              </thead>
              <tbody>
                {stats.bestSellers.map((item) => (
                  <tr key={item.slug} className="border-t border-ink-100">
                    <td className="py-2 font-bold text-ink-800">{item.name}</td>
                    <td className="py-2 text-end font-bold text-ink-600">{formatNumber(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section aria-label="المبيعات حسب المحافظة" className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">المبيعات حسب المحافظة</h2>
          {stats.salesByGovernorate.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">لا توجد بيانات بعد.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">إجمالي المبيعات لكل محافظة</caption>
              <thead>
                <tr className="text-[0.72rem] font-bold text-ink-400">
                  <th scope="col" className="text-start">المحافظة</th>
                  <th scope="col" className="text-start">طلبات</th>
                  <th scope="col" className="text-start">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {stats.salesByGovernorate.slice(0, 12).map((row) => (
                  <tr key={row.governorate} className="border-t border-ink-100">
                    <td className="py-1.5 text-ink-800">{row.governorate}</td>
                    <td className="py-1.5 text-ink-600">{formatNumber(row.orders)}</td>
                    <td className="py-1.5 font-bold text-ink-900">{formatPrice(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section aria-label="تنبيه المخزون" className="card p-5">
        <h2 className="text-base font-extrabold text-ink-950">منخفض المخزون</h2>
        {stats.lowStock.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">لا توجد منتجات منخفضة المخزون.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {stats.lowStock.map((item) => (
              <li key={item.slug} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/admin/products/${item.slug}`} className="font-bold text-ink-800 hover:text-brand-600">
                  {item.name}
                </Link>
                <span className="font-extrabold text-red-600">
                  {formatNumber(item.stock)} / حد أدنى {formatNumber(item.minStock)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}