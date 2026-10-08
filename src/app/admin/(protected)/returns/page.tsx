import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { listReturns } from "@/lib/returns/store";
import { RETURN_STATUS_LABEL, type ReturnStatus } from "@/lib/returns/types";
import { updateReturnAction } from "@/app/admin/(protected)/returns/actions";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "المرتجعات" };
export const dynamic = "force-dynamic";

const STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "received", "refunded", "closed"];

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const admin = await requirePermission("returns.view");
  const params = await searchParams;
  const canManage = can(admin.role, "returns.manage");
  const returns = await listReturns();

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">المرتجعات</p>
        <h1 className="h-section">طلبات الاسترجاع</h1>
        <p className="mt-1 text-sm text-ink-500">
          {returns.length} طلب — جديد: {returns.filter((r) => r.status === "requested").length} · معتمد: {returns.filter((r) => r.status === "approved").length}
        </p>
      </header>

      {params.ok && <Notice tone="ok">{params.ok}</Notice>}
      {params.err && <Notice tone="error">{params.err}</Notice>}

      <section className="space-y-3">
        {returns.length === 0 && <p className="text-sm text-ink-500">لا توجد طلبات مرتجعات بعد.</p>}
        {returns.map((ret) => (
          <details key={ret.id} className="card p-4">
            <summary className="cursor-pointer text-sm font-bold text-ink-900">
              #{ret.id.slice(0, 8)} — {ret.orderNumber} — {ret.customerName} — {RETURN_STATUS_LABEL[ret.status]}
            </summary>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 text-sm text-ink-700">
                <p>الهاتف: {ret.phone}</p>
                <p>السبب: {ret.reasonCategory}</p>
                <p className="text-ink-500">تفصيل السبب: {ret.reasonText}</p>
                {ret.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ret.images.map((url) => (
                      <a key={url} href={url} target="_blank" className="text-xs font-bold text-brand-600 hover:underline">{url}</a>
                    ))}
                  </div>
                )}
                <div className="rounded-lg bg-ink-50 p-3 text-sm">
                  <p className="font-bold text-ink-900">سجل العملية</p>
                  <ul className="mt-1 space-y-1">
                    {ret.history.map((h) => (
                      <li key={h.at + h.action} className="text-xs text-ink-500">
                        {h.at.slice(0, 16)} — {h.by}: {h.action}
                        {h.note ? ` — ${h.note}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <form action={updateReturnAction} className="space-y-3">
                <input type="hidden" name="id" value={ret.id} />
                <label className="block">
                  <span className="label">حالة الطلب</span>
                  <select name="status" defaultValue={ret.status} className="field" disabled={!canManage}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{RETURN_STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">تكلفة شحن المرتجع</span>
                    <input name="shippingCost" type="number" defaultValue={ret.shippingCost} className="field" dir="ltr" disabled={!canManage} />
                  </label>
                  <label className="block">
                    <span className="label">المبلغ المسترد</span>
                    <input name="refundAmount" type="number" defaultValue={ret.refundAmount} className="field" dir="ltr" disabled={!canManage} />
                  </label>
                </div>
                <label className="block">
                  <span className="label">ملاحظات المشرف (داخلية)</span>
                  <textarea name="adminNotes" rows={3} defaultValue={ret.adminNotes} className="field" disabled={!canManage} />
                </label>
                <label className="block">
                  <span className="label">إضافة ملاحظة لسجل العملية</span>
                  <input name="historyNote" className="field" placeholder="مثال: تم التواصل مع العميل" disabled={!canManage} />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {canManage && <button type="submit" className="btn btn-primary">حفظ التعديلات</button>}
                  <span className="text-xs text-ink-400">تم الإنشاء: {ret.createdAt.slice(0, 16)} · آخر تحديث: {ret.updatedAt.slice(0, 16)}</span>
                </div>
              </form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

function Notice({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return (
    <p role="status" className={`rounded-lg px-3 py-2 text-sm font-bold ${tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
      {children}
    </p>
  );
}