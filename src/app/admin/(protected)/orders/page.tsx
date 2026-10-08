import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/store";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, GOVERNORATES, type OrderStatus } from "@/lib/orders/types";
import { formatNumber, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "الطلبات" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = { status?: string; gov?: string; page?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("orders.view");
  const params = await searchParams;
  const status = params.status ?? "all";
  const gov = params.gov ?? "all";
  const requestedPage = Math.max(1, Number(params.page ?? "1") || 1);

  const all = await listOrders();
  let orders = all;
  if (status !== "all") orders = orders.filter((o) => o.status === status);
  if (gov !== "all") orders = orders.filter((o) => o.address.governorate === gov);
  orders = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const slice = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    pending: all.filter((o) => o.status === "pending").length,
    confirmed: all.filter((o) => o.status === "confirmed").length,
    preparing: all.filter((o) => o.status === "preparing").length,
  };

  function href(next: Partial<Search>): string {
    const search = new URLSearchParams();
    const merged = { status, gov, ...next };
    if (merged.status && merged.status !== "all") search.set("status", merged.status);
    if (merged.gov && merged.gov !== "all") search.set("gov", merged.gov);
    if (merged.page && merged.page !== "1") search.set("page", merged.page);
    return `/admin/orders${search.toString() ? `?${search}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">المبيعات</p>
        <h1 className="h-section">الطلبات</h1>
        <p className="mt-1 text-sm text-ink-500">
          {formatNumber(all.length)} طلب — جديد: {formatNumber(counts.pending)}، مؤكد: {formatNumber(counts.confirmed)}، قيد التجهيز: {formatNumber(counts.preparing)}
        </p>
      </header>

      <form className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="status" className="label">الحالة</label>
          <select id="status" name="status" defaultValue={status} className="field">
            <option value="all">الكل</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gov" className="label">المحافظة</label>
          <select id="gov" name="gov" defaultValue={gov} className="field">
            <option value="all">الكل</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">تصفية</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <caption className="sr-only">قائمة الطلبات</caption>
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">رقم الطلب</th>
              <th scope="col" className="p-3 text-start">التاريخ</th>
              <th scope="col" className="p-3 text-start">العميل</th>
              <th scope="col" className="p-3 text-start">المحافظة</th>
              <th scope="col" className="p-3 text-start">الإجمالي</th>
              <th scope="col" className="p-3 text-start">الحالة</th>
              <th scope="col" className="p-3 text-start"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {slice.map((o) => (
              <tr key={o.id}>
                <td className="p-3 font-bold text-ink-900" dir="ltr">{o.orderNumber}</td>
                <td className="p-3 text-ink-500" dir="ltr">{o.createdAt.slice(0, 10)}</td>
                <td className="p-3 text-ink-800">{o.address.fullName}</td>
                <td className="p-3 text-ink-600">{o.address.governorate}</td>
                <td className="p-3 font-bold text-ink-900">{formatPrice(o.totals.total)}</td>
                <td className="p-3">
                  <span className="rounded-md bg-ink-100 px-2 py-1 text-[0.7rem] font-bold text-ink-700">
                    {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="font-bold text-brand-600 hover:underline">
                    تفاصيل
                  </Link>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink-500">لا توجد طلبات مطابقة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="تنقّل الصفحات" className="flex flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ page: String(n) })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${n === page ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}