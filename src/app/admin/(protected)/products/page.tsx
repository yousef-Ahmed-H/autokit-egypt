import Link from "next/link";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import { STOCK_LABEL, stockStatus } from "@/lib/data/products";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ProductStatus } from "@/lib/types";

export const metadata: Metadata = { title: "المنتجات" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUS_LABEL: Record<ProductStatus, string> = {
  active: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

type Search = { q?: string; status?: string; page?: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requirePermission("products.view");
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";
  const requestedPage = Math.max(1, Number(params.page ?? "1") || 1);

  let products = await getMergedProducts();
  if (q) {
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }
  if (status !== "all") {
    products = products.filter((p) => p.status === status);
  }

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const slice = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">الكتالوج</p>
          <h1 className="h-section">المنتجات</h1>
          <p className="mt-1 text-sm text-ink-500">
            {formatNumber(products.length)} منتج — صفحة {page} من {totalPages}
          </p>
        </div>
      </header>

      <form className="card flex flex-wrap items-end gap-3 p-4" role="search">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="label">بحث بالاسم أو الكود (SKU)</label>
          <input id="q" name="q" defaultValue={params.q ?? ""} className="field" placeholder="مثال: شاحن أو AK-..." />
        </div>
        <div>
          <label htmlFor="status" className="label">الحالة</label>
          <select id="status" name="status" defaultValue={status} className="field">
            <option value="all">الكل</option>
            <option value="active">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">تصفية</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">قائمة المنتجات مع المخزون والسعر والحالة</caption>
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">المنتج</th>
              <th scope="col" className="p-3 text-start">SKU</th>
              <th scope="col" className="p-3 text-start">السعر</th>
              <th scope="col" className="p-3 text-start">المخزون</th>
              <th scope="col" className="p-3 text-start">الحالة</th>
              <th scope="col" className="p-3 text-start">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {slice.map((p) => {
              const stock = stockStatus(p);
              return (
                <tr key={p.slug}>
                  <td className="p-3 font-bold text-ink-900">{p.name}</td>
                  <td className="p-3 text-ink-500" dir="ltr">{p.sku}</td>
                  <td className="p-3 text-ink-800">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={stock === "out_of_stock" ? "font-bold text-red-600" : stock === "low_stock" ? "font-bold text-amber-600" : "text-ink-700"}>
                      {formatNumber(p.stock)} — {STOCK_LABEL[stock]}
                    </span>
                  </td>
                  <td className="p-3 text-ink-600">{STATUS_LABEL[p.status]}</td>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.slug}`} className="font-bold text-brand-600 hover:underline">
                      تعديل
                    </Link>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-500">لا توجد منتجات مطابقة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="تنقّل الصفحات" className="flex flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            const search = new URLSearchParams();
            if (params.q) search.set("q", params.q);
            if (status !== "all") search.set("status", status);
            if (n > 1) search.set("page", String(n));
            return (
              <Link
                key={n}
                href={`/admin/products${search.toString() ? `?${search}` : ""}`}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${n === page ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"}`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}