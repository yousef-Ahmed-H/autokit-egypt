import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { listCompanies, listShipments, listZones } from "@/lib/shipping/store";
import { SHIPMENT_STATUS_LABEL, type ShipmentStatus } from "@/lib/shipping/types";
import { updateCompanyAction, updateShipmentAction, updateZoneAction } from "@/app/admin/(protected)/shipping/actions";
import { formatNumber, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "الشحن" };
export const dynamic = "force-dynamic";

const STATUS_KEYS: ShipmentStatus[] = [
  "draft",
  "created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
];

export default async function ShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const admin = await requirePermission("shipping.view");
  const params = await searchParams;
  const canManage = can(admin.role, "shipping.manage");
  const [companies, zones, shipments] = await Promise.all([
    listCompanies(),
    listZones(),
    listShipments(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">التوصيل</p>
        <h1 className="h-section">الشحن</h1>
        <p className="mt-1 text-sm text-ink-500">
          شركات ومناطق الشحن. الربط مع Bosta/Mylerz/Aramex هيكلي فقط — لا إرسال فعلي بدون مفاتيح وموافقة، والإدخال يدوي.
        </p>
      </header>

      {params.ok && <Notice tone="ok">{params.ok}</Notice>}
      {params.err && <Notice tone="error">{params.err}</Notice>}

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-ink-950">شركات الشحن</h2>
        <p className="mt-1 text-xs text-ink-500">
          «متصل» يعني توفر مفاتيح الـ API في البيئة، وليس إرسالًا فعليًا.
        </p>
        <div className="mt-3 space-y-4">
          {companies.map((company) => (
            <form key={company.id} action={updateCompanyAction} className="grid gap-3 rounded-lg border border-ink-100 p-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={company.id} />
              <label className="block">
                <span className="label">الاسم</span>
                <input name="name" defaultValue={company.name} className="field" disabled={!canManage} />
              </label>
              <div className="flex items-end gap-4">
                <span className={`rounded-md px-2 py-1 text-xs font-bold ${company.credentialsConfigured ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"}`} dir="ltr">
                  {company.adapter} · {company.credentialsConfigured ? "configured" : "not configured"}
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked={company.active} disabled={!canManage} />
                  مفعّلة
                </label>
              </div>
              <label className="block sm:col-span-2">
                <span className="label">ملاحظات</span>
                <input name="notes" defaultValue={company.notes} className="field" disabled={!canManage} />
              </label>
              {canManage && (
                <button type="submit" className="btn btn-outline w-fit">حفظ الشركة</button>
              )}
            </form>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-ink-950">مناطق الشحن ({formatNumber(zones.length)} محافظة)</h2>
        <div className="mt-3 space-y-3">
          {zones.map((zone) => (
            <details key={zone.id} className="rounded-lg border border-ink-100 p-3">
              <summary className="cursor-pointer text-sm font-bold text-ink-800">
                {zone.governorate} — {formatPrice(zone.shippingFee)} · مرتجع {formatPrice(zone.returnFee)} · {zone.etaMinDays}-{zone.etaMaxDays} يوم
              </summary>
              <form action={updateZoneAction} className="mt-3 grid gap-3 sm:grid-cols-3">
                <input type="hidden" name="id" value={zone.id} />
                <label className="block">
                  <span className="label">سعر الشحن (ج.م)</span>
                  <input name="shippingFee" type="number" defaultValue={zone.shippingFee} className="field" disabled={!canManage} />
                </label>
                <label className="block">
                  <span className="label">تكلفة المرتجع (ج.م)</span>
                  <input name="returnFee" type="number" defaultValue={zone.returnFee} className="field" disabled={!canManage} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="label">أقل مدة</span>
                    <input name="etaMinDays" type="number" defaultValue={zone.etaMinDays} className="field" disabled={!canManage} />
                  </label>
                  <label className="block">
                    <span className="label">أقصى مدة</span>
                    <input name="etaMaxDays" type="number" defaultValue={zone.etaMaxDays} className="field" disabled={!canManage} />
                  </label>
                </div>
                <label className="block sm:col-span-3">
                  <span className="label">المراكز (سطر لكل مركز)</span>
                  <textarea name="centers" rows={2} defaultValue={zone.centers.join("\n")} className="field" disabled={!canManage} />
                </label>
                <label className="block sm:col-span-3">
                  <span className="label">مناطق بعيدة (سطر لكل منطقة)</span>
                  <textarea name="remoteAreas" rows={2} defaultValue={zone.remoteAreas.join("\n")} className="field" disabled={!canManage} />
                </label>
                <label className="block sm:col-span-3">
                  <span className="label">القرى (لكل سطر: المركز | قرية1, قرية2)</span>
                  <textarea
                    name="villages"
                    rows={2}
                    defaultValue={Object.entries(zone.villages).map(([k, v]) => `${k} | ${v.join(", ")}`).join("\n")}
                    className="field"
                    disabled={!canManage}
                  />
                </label>
                <div className="flex items-center gap-4 sm:col-span-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="codEnabled" defaultChecked={zone.codEnabled} disabled={!canManage} />
                    الدفع عند الاستلام
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={zone.active} disabled={!canManage} />
                    مفعّلة
                  </label>
                  {canManage && <button type="submit" className="btn btn-outline">حفظ المنطقة</button>}
                </div>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-extrabold text-ink-950">الشحنات ({formatNumber(shipments.length)})</h2>
        {shipments.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">لا توجد شحنات مسجّلة بعد.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {shipments.map((shipment) => (
              <form key={shipment.id} action={updateShipmentAction} className="grid gap-3 rounded-lg border border-ink-100 p-3 sm:grid-cols-4">
                <input type="hidden" name="id" value={shipment.id} />
                <div className="text-sm">
                  <p className="font-bold text-ink-900" dir="ltr">{shipment.orderNumber}</p>
                  <p className="text-xs text-ink-500">{shipment.governorate} — {shipment.center}</p>
                  <p className="text-xs text-ink-400">{shipment.manual ? "إدخال يدوي" : "ربط تلقائي"} · COD {formatPrice(shipment.codAmount)}</p>
                </div>
                <label className="block">
                  <span className="label">رقم التتبّع</span>
                  <input name="trackingNumber" defaultValue={shipment.trackingNumber} className="field" dir="ltr" disabled={!canManage} />
                </label>
                <label className="block">
                  <span className="label">رابط التتبّع</span>
                  <input name="trackingUrl" defaultValue={shipment.trackingUrl} className="field" dir="ltr" disabled={!canManage} />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1">
                    <span className="label">الحالة</span>
                    <select name="status" defaultValue={shipment.status} className="field" disabled={!canManage}>
                      {STATUS_KEYS.map((key) => (
                        <option key={key} value={key}>{SHIPMENT_STATUS_LABEL[key]}</option>
                      ))}
                    </select>
                  </label>
                  {canManage && <button type="submit" className="btn btn-outline">حفظ</button>}
                </div>
              </form>
            ))}
          </div>
        )}
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