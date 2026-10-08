import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { coupons as demoCoupons } from "@/lib/pricing";
import { can } from "@/lib/admin/permissions";
import { createCouponAction, deleteCouponAction } from "@/app/admin/(protected)/coupons/actions";
import type { Coupon } from "@/lib/types";

export const metadata: Metadata = { title: "الكوبونات" };
export const dynamic = "force-dynamic";

async function readCustom(): Promise<Coupon[]> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const file = path.join(process.cwd(), ".data", "coupons.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const admin = await requirePermission("coupons.view");
  const params = await searchParams;
  const canManage = can(admin.role, "coupons.manage");
  const custom = await readCustom();
  const all = [...custom, ...demoCoupons].filter((c, i, arr) => arr.findIndex((x) => x.code === c.code) === i);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">البيع</p>
        <h1 className="h-section">الكوبونات</h1>
      </header>

      {params.ok && <Notice tone="ok">{params.ok}</Notice>}
      {params.err && <Notice tone="error">{params.err}</Notice>}

      <section className="card p-5">
        <h2 className="text-sm font-extrabold text-ink-950">قائمة الكوبونات</h2>
        <table className="mt-3 w-full min-w-[560px] text-sm">
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">الكود</th>
              <th scope="col" className="p-3 text-start">النوع</th>
              <th scope="col" className="p-3 text-start">القيمة</th>
              <th scope="col" className="p-3 text-start">حد أدنى</th>
              <th scope="col" className="p-3 text-start">الوصف</th>
              <th scope="col" className="p-3 text-start"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {all.map((c) => (
              <tr key={c.code}>
                <td className="p-3 font-bold" dir="ltr">{c.code}</td>
                <td className="p-3">{c.type === "percent" ? "نسبة" : c.type === "fixed" ? "مبلغ ثابت" : "شحن مجاني"}</td>
                <td className="p-3" dir="ltr">{c.value}</td>
                <td className="p-3">{c.minSubtotal ?? "—"}</td>
                <td className="p-3">{c.description}</td>
                <td className="p-3">
                  {canManage && custom.some((x) => x.code === c.code) && (
                    <form action={deleteCouponAction}>
                      <input type="hidden" name="code" value={c.code} />
                      <button type="submit" className="text-xs font-bold text-red-600 hover:underline">حذف</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {canManage && (
        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">إضافة كوبون مخصص</h2>
          <form action={createCouponAction} className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="label">الكود</span>
              <input name="code" required className="field" dir="ltr" />
            </label>
            <label className="block">
              <span className="label">النوع</span>
              <select name="type" defaultValue="percent" className="field">
                <option value="percent">نسبة %</option>
                <option value="fixed">مبلغ ثابت (ج.م)</option>
                <option value="shipping">شحن مجاني</option>
              </select>
            </label>
            <label className="block">
              <span className="label">القيمة</span>
              <input name="value" type="number" required className="field" dir="ltr" />
            </label>
            <label className="block">
              <span className="label">حد أدنى للمشتريات</span>
              <input name="minSubtotal" type="number" className="field" dir="ltr" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">وصف</span>
              <input name="description" className="field" />
            </label>
            <div className="sm:col-span-3">
              <button type="submit" className="btn btn-primary">إنشاء الكوبون</button>
            </div>
          </form>
        </section>
      )}
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