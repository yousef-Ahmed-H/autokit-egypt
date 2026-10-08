import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listBanners } from "@/lib/content/store";
import { addBannerAction, saveBannersAction } from "@/app/admin/(protected)/banners/actions";

export const metadata: Metadata = { title: "البنرات" };
export const dynamic = "force-dynamic";

export default async function BannersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requirePermission("content.manage");
  const { ok } = await searchParams;
  const banners = await listBanners();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">المحتوى</p>
          <h1 className="h-section">البنرات</h1>
        </div>
        <form action={addBannerAction} className="flex flex-wrap items-center gap-2">
          <input name="title" className="field w-36" placeholder="العنوان" />
          <input name="href" className="field w-48" placeholder="رابط /products/..." />
          <button type="submit" className="btn btn-outline">إضافة بنر</button>
        </form>
      </header>

      {ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{ok}</p>}

      <form action={saveBannersAction} className="space-y-3">
        {banners.map((b) => (
          <section key={b.id} className="card grid gap-3 p-4 sm:grid-cols-6">
            <label className="block sm:col-span-2">
              <span className="label">العنوان</span>
              <input name={`title_${b.id}`} defaultValue={b.title} className="field" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">نص مختصر</span>
              <input name={`text_${b.id}`} defaultValue={b.text} className="field" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">رابط</span>
              <input name={`href_${b.id}`} defaultValue={b.href} className="field" dir="ltr" />
            </label>
            <label className="block">
              <span className="label">ترتيب</span>
              <input name={`order_${b.id}`} type="number" defaultValue={b.order} className="field" dir="ltr" />
            </label>
            <label className="flex items-end gap-2 pb-2">
              <input type="checkbox" name={`active_${b.id}`} defaultChecked={b.active} />
              <span className="text-sm">نشط</span>
            </label>
          </section>
        ))}
        <button type="submit" className="btn btn-primary">حفظ البنرات</button>
      </form>
    </div>
  );
}