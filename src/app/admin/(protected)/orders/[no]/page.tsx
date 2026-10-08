import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { findOrderByNumber } from "@/lib/orders/store";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/orders/types";
import { listCompanies, findShipmentByOrder } from "@/lib/shipping/store";
import { SHIPMENT_STATUS_LABEL } from "@/lib/shipping/types";
import { changeStatusAction, createShipmentAction, saveOrderNotesAction } from "@/app/admin/(protected)/orders/actions";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "تفاصيل الطلب" };
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ no: string }>;
  searchParams: Promise<{ ok?: string; ship?: string; err?: string }>;
}) {
  const admin = await requirePermission("orders.view");
  const { no } = await params;
  const { ok, ship, err } = await searchParams;

  const order = await findOrderByNumber(decodeURIComponent(no));
  if (!order) notFound();

  const [companies, shipment] = await Promise.all([
    listCompanies(),
    findShipmentByOrder(order.orderNumber),
  ]);
  const canStatus = can(admin.role, "orders.update_status");
  const canShip = can(admin.role, "shipping.manage");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-sm font-bold text-brand-600 hover:underline">← كل الطلبات</Link>
        <h1 className="h-section" dir="ltr">{order.orderNumber}</h1>
        <span className="rounded-md bg-ink-100 px-2 py-1 text-xs font-bold text-ink-700">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {ok === "status" && <Notice tone="ok">تم تحديث حالة الطلب.</Notice>}
      {ok === "notes" && <Notice tone="ok">تم حفظ الملاحظات.</Notice>}
      {ship && <Notice tone="info">{ship}</Notice>}
      {err && <Notice tone="error">{err}</Notice>}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-extrabold text-ink-950">أصناف الطلب</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-[0.72rem] text-ink-500">
                <tr>
                  <th scope="col" className="p-2 text-start">المنتج</th>
                  <th scope="col" className="p-2 text-start">SKU</th>
                  <th scope="col" className="p-2 text-start">الكمية</th>
                  <th scope="col" className="p-2 text-start">السعر</th>
                  <th scope="col" className="p-2 text-start">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {order.items.map((item) => (
                  <tr key={item.slug}>
                    <td className="p-2 font-bold text-ink-800">{item.name}</td>
                    <td className="p-2 text-ink-500" dir="ltr">{item.sku}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{formatPrice(item.unitPrice)}</td>
                    <td className="p-2 font-bold">{formatPrice(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 grid gap-1 border-t border-ink-100 pt-3 text-sm">
            <Row label="المجموع الفرعي" value={formatPrice(order.totals.subtotal)} />
            <Row label="الخصم" value={order.totals.discount ? `- ${formatPrice(order.totals.discount)}` : "—"} />
            <Row label="الشحن" value={formatPrice(order.totals.shipping)} />
            {order.totals.couponCode && <Row label="الكوبون" value={order.totals.couponCode} />}
            <Row label="الإجمالي" value={formatPrice(order.totals.total)} strong />
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">بيانات التوصيل</h2>
          <div className="mt-3 space-y-1 text-sm text-ink-700">
            <p className="font-bold text-ink-900">{order.address.fullName}</p>
            <p dir="ltr">{order.address.phone}{order.address.phone2 ? ` / ${order.address.phone2}` : ""}</p>
            <p>{order.address.governorate} — {order.address.city}{order.address.village ? ` — ${order.address.village}` : ""}</p>
            <p>{order.address.street}{order.address.houseNo ? `، ${order.address.houseNo}` : ""}{order.address.floor ? `، الدور ${order.address.floor}` : ""}</p>
            {order.address.landmark && <p>علامة مميزة: {order.address.landmark}</p>}
            {order.address.notes && <p className="text-ink-500">ملاحظات العميل: {order.address.notes}</p>}
            <p className="text-ink-400">الدفع: عند الاستلام (COD)</p>
          </div>
        </section>
      </div>

      {canStatus && (
        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">تحديث الحالة والملاحظات</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <form action={changeStatusAction} className="space-y-2">
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <label htmlFor="status" className="label">الحالة</label>
              <select id="status" name="status" defaultValue={order.status} className="field">
                {ORDER_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">حفظ الحالة</button>
            </form>

            <form action={saveOrderNotesAction} className="space-y-2">
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <label htmlFor="adminNotes" className="label">ملاحظات داخلية (لا تظهر للعميل)</label>
              <textarea id="adminNotes" name="adminNotes" rows={3} defaultValue={order.adminNotes ?? ""} className="field" />
              <button type="submit" className="btn btn-outline">حفظ الملاحظات</button>
            </form>
          </div>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-sm font-extrabold text-ink-950">الشحن</h2>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-800">
          ⚠️ لا يتم إرسال أي شحنة فعلية لأي شركة شحن. هذا إدخال يدوي فقط، ولا يوجد تتبّع مباشر قبل ربط الـ API.
        </p>

        {shipment ? (
          <div className="mt-3 space-y-1 text-sm text-ink-700">
            <Row label="رقم التتبّع" value={shipment.trackingNumber || "—"} />
            <p className="text-xs text-ink-500">الحالة: {SHIPMENT_STATUS_LABEL[shipment.status]}</p>
          </div>
        ) : canShip ? (
          <form action={createShipmentAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="orderNumber" value={order.orderNumber} />
            <div>
              <label htmlFor="companyId" className="label">شركة الشحن</label>
              <select id="companyId" name="companyId" className="field">
                {companies.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.active}>{c.name}{c.active ? "" : " (غير مفعّلة)"}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-dark">تسجيل شحنة يدوية</button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-ink-500">لا تملك صلاحية إدارة الشحن.</p>
        )}
      </section>

      {shipment && (
        <p className="text-xs text-ink-400">
          حالة الشحنة: {SHIPMENT_STATUS_LABEL[shipment.status]} — {shipment.manual ? "إدخال يدوي" : "ربط تلقائي"}
        </p>
      )}
    </div>
  );
}

function Notice({ tone, children }: { tone: "ok" | "error" | "info"; children: React.ReactNode }) {
  const cls = tone === "ok" ? "bg-emerald-50 text-emerald-700" : tone === "error" ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-700";
  return <p role="status" className={`rounded-lg px-3 py-2 text-sm font-bold ${cls}`}>{children}</p>;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={strong ? "font-extrabold text-ink-950" : "text-ink-800"}>{value}</dd>
    </div>
  );
}