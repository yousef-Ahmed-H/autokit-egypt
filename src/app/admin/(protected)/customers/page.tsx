import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/store";

export const metadata: Metadata = { title: "العملاء" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requirePermission("customers.view");
  const orders = await listOrders();

  const map = new Map<string, { name: string; phone: string; orders: number; total: number }>();
  for (const o of orders) {
    const key = (o.address.phone.replace(/\D/g, "") || o.address.fullName).toLowerCase();
    const cur = map.get(key) ?? { name: o.address.fullName, phone: o.address.phone, orders: 0, total: 0 };
    cur.orders += 1;
    cur.total += o.totals.total;
    map.set(key, cur);
  }
  const customers = [...map.values()].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">البيع</p>
        <h1 className="h-section">العملاء</h1>
        <p className="mt-1 text-sm text-ink-500">
          العملاء استُنتجوا من الطلبات الحالية (نسخة تطوير فقط). عند ربط قاعدة البيانات سيُصبح لكل عميل ملف مستقل.
        </p>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">الاسم</th>
              <th scope="col" className="p-3 text-start">الهاتف</th>
              <th scope="col" className="p-3 text-start">عدد الطلبات</th>
              <th scope="col" className="p-3 text-start">إجمالي المشتريات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {customers.map((c) => (
              <tr key={c.phone + c.name}>
                <td className="p-3 font-bold text-ink-900">{c.name}</td>
                <td className="p-3" dir="ltr">{c.phone}</td>
                <td className="p-3">{c.orders}</td>
                <td className="p-3 font-bold">{c.total.toLocaleString("ar-EG", { style: "currency", currency: "EGP" })}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-500">لا توجد بيانات بعد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}