import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import { stockStatus, STOCK_LABEL } from "@/lib/data/products";
import { formatNumber } from "@/lib/format";
import { updateStockAction } from "@/app/admin/(protected)/inventory/actions";

export const metadata: Metadata = { title: "المخزون" };
export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requirePermission("inventory.view");
  const { ok } = await searchParams;
  const products = await getMergedProducts();

  const low = products.filter((p) => p.status === "active" && p.stock <= p.minStock);
  const out = products.filter((p) => p.stock <= 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">الكتالوج</p>
        <h1 className="h-section">المخزون</h1>
        <p className="mt-1 text-sm text-ink-500">
          {formatNumber(products.length)} منتج — منخفض: {formatNumber(low.length)} — نفد: {formatNumber(out.length)}
        </p>
      </header>

      {ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{ok}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="sr-only">تعديل المخزون لكل منتج</caption>
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">المنتج</th>
              <th scope="col" className="p-3 text-start">الحالة</th>
              <th scope="col" className="p-3 text-start">المخزون</th>
              <th scope="col" className="p-3 text-start">الحد الأدنى</th>
              <th scope="col" className="p-3 text-start">حفظ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((p) => {
              const status = stockStatus(p);
              return (
                <tr key={p.slug}>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.slug}`} className="font-bold text-ink-900 hover:text-brand-600">
                      {p.name}
                    </Link>
                    <span className="block text-[0.7rem] text-ink-400" dir="ltr">{p.sku}</span>
                  </td>
                  <td className="p-3">
                    <span
                        className={
                          status === "out_of_stock"
                            ? "font-bold text-red-600"
                            : status === "low_stock"
                              ? "font-bold text-amber-600"
                              : "text-emerald-600"
                        }
                      >
                        {STOCK_LABEL[status]}
                      </span>
                  </td>
                  <td className="p-3" colSpan={3}>
                    <form action={updateStockAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="slug" value={p.slug} />
                      <input type="number" name="stock" defaultValue={p.stock} min={0} dir="ltr" className="field w-24" aria-label={`مخزون ${p.name}`} />
                      <input type="number" name="minStock" defaultValue={p.minStock} min={0} dir="ltr" className="field w-24" aria-label={`حد أدنى ${p.name}`} />
                      <button type="submit" className="btn btn-outline">حفظ</button>
                      <Link href={`/admin/products/${p.slug}`} className="text-xs font-bold text-brand-600 hover:underline">تعديل كامل</Link>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}