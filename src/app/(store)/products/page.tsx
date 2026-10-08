import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import { getProductsPage, listCategories } from "@/lib/db/queries";
import { DEMO_NOTICE, PAGE_SIZE, priceRanges, sortOptions } from "@/lib/data/products";
import { IS_DEMO } from "@/lib/config";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفّح إكسسوارات السيارات: فلترة بالقسم والسعر وترتيب حسب الأكثر مبيعًا أو الأحدث.",
};

type Search = {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
  page?: string;
};

function buildHref(base: Search, patch: Partial<Search>): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category && next.category !== "all") params.set("category", next.category);
  if (next.price && next.price !== "all") params.set("price", next.price);
  if (next.sort && next.sort !== "popular") params.set("sort", next.sort);
  if (next.page && Number(next.page) > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";
  const activePrice = params.price ?? "all";
  const activeSort = params.sort ?? "popular";
  const requestedPage = Number(params.page ?? "1") || 1;

  const [categories, result] = await Promise.all([
    listCategories(),
    getProductsPage({
      q: params.q,
      category: activeCategory,
      price: activePrice,
      sort: activeSort,
      page: requestedPage,
    }),
  ]);

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name ?? "كل المنتجات";
  const activePriceLabel = priceRanges.find((r) => r.key === activePrice)?.label;
  const base: Search = { ...params, page: undefined };
  const pageNumbers = Array.from({ length: result.totalPages }, (_, i) => i + 1).filter(
    (n) => Math.abs(n - result.page) <= 2 || n === 1 || n === result.totalPages,
  );

  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">المنتجات</li>
        </ol>
      </nav>

      <header className="mb-6">
        <p className="eyebrow mb-1.5">المتجر</p>
        <h1 className="h-section">{activeCategoryName}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {result.total} منتج
          {params.q ? <> — نتيجة بحث: <span className="font-bold text-ink-800">«{params.q}»</span></> : null}
          {activePriceLabel ? <> — السعر: {activePriceLabel}</> : null}
          <span className="text-ink-400"> — صفحة {result.page} من {result.totalPages}</span>
        </p>
        {IS_DEMO && <p className="mt-3"><span className="demo-tag">{DEMO_NOTICE}</span></p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside aria-label="تصفية المنتجات">
          <form action="/products" method="get" className="card p-4 lg:sticky lg:top-32">
            {params.category && params.category !== "all" && (
              <input type="hidden" name="category" value={params.category} />
            )}
            {params.sort && params.sort !== "popular" && (
              <input type="hidden" name="sort" value={params.sort} />
            )}
            {params.price && params.price !== "all" && (
              <input type="hidden" name="price" value={params.price} />
            )}

            <label htmlFor="q" className="mb-2 block text-sm font-extrabold text-ink-950">بحث</label>
            <input id="q" name="q" type="search" defaultValue={params.q ?? ""} placeholder="اسم المنتج أو الكود…" className="field" />
            <button type="submit" className="btn btn-dark mt-2 w-full">بحث</button>

            <hr className="my-4 border-ink-100" />

            <h2 className="mb-2 text-sm font-extrabold text-ink-950">الأقسام</h2>
            <ul className="flex flex-wrap gap-2 lg:block lg:space-y-1.5">
              <li>
                <Link href={buildHref(base, { category: "all", page: undefined })} className={chip(activeCategory === "all")}>
                  كل المنتجات
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={buildHref(base, { category: cat.slug, page: undefined })} className={chip(activeCategory === cat.slug)}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-ink-100" />

            <h2 className="mb-2 text-sm font-extrabold text-ink-950">السعر</h2>
            <ul className="flex flex-wrap gap-2 lg:block lg:space-y-1.5">
              <li>
                <Link href={buildHref(base, { price: "all", page: undefined })} className={chip(activePrice === "all")}>
                  كل الأسعار
                </Link>
              </li>
              {priceRanges.map((range) => (
                <li key={range.key}>
                  <Link href={buildHref(base, { price: range.key, page: undefined })} className={chip(activePrice === range.key)}>
                    {range.label}
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-ink-100" />

            <h2 className="mb-2 text-sm font-extrabold text-ink-950">الترتيب</h2>
            <ul className="flex flex-wrap gap-2 lg:block lg:space-y-1.5">
              {sortOptions.map((opt) => (
                <li key={opt.key}>
                  <Link href={buildHref(base, { sort: opt.key, page: undefined })} className={chipSort(activeSort === opt.key)}>
                    {opt.label}
                  </Link>
                </li>
              ))}
            </ul>
          </form>
        </aside>

        <section aria-live="polite">
          {result.items.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="text-lg font-extrabold text-ink-950">لا توجد نتائج</h2>
              <p className="mt-2 text-sm text-ink-500">جرّب تغيير الفلاتر أو كلمة البحث.</p>
              <Link href="/products" className="btn btn-primary mt-5">إعادة ضبط الفلاتر</Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((product) => (
                <li key={product.id}><ProductCard product={product} /></li>
              ))}
            </ul>
          )}

          {result.totalPages > 1 && (
            <nav aria-label="تصفح الصفحات" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={buildHref(base, { page: String(Math.max(1, result.page - 1)) })}
                aria-disabled={!result.hasPrev}
                className={`btn btn-outline px-3 py-2 text-sm ${!result.hasPrev ? "pointer-events-none opacity-50" : ""}`}
              >
                السابق
              </Link>

              {pageNumbers.map((n, index) => (
                <span key={n} className="flex items-center gap-2">
                  {index > 0 && pageNumbers[index - 1] !== n - 1 && <span className="text-ink-400">…</span>}
                  <Link
                    href={buildHref(base, { page: String(n) })}
                    aria-current={n === result.page ? "page" : undefined}
                    className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-bold ${
                      n === result.page
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-ink-200 text-ink-700 hover:border-ink-900"
                    }`}
                  >
                    {n}
                  </Link>
                </span>
              ))}

              <Link
                href={buildHref(base, { page: String(Math.min(result.totalPages, result.page + 1)) })}
                aria-disabled={!result.hasNext}
                className={`btn btn-outline px-3 py-2 text-sm ${!result.hasNext ? "pointer-events-none opacity-50" : ""}`}
              >
                التالي
              </Link>
            </nav>
          )}

          <p className="mt-4 text-center text-xs text-ink-400">
            {PAGE_SIZE} منتجًا في الصفحة — إجمالي {result.total}
          </p>
        </section>
      </div>
    </div>
  );
}

function chip(active: boolean): string {
  return `block rounded-lg px-3 py-2 text-[0.85rem] font-bold ${
    active ? "bg-ink-950 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
  }`;
}

function chipSort(active: boolean): string {
  return `block rounded-lg px-3 py-2 text-[0.85rem] font-bold ${
    active ? "bg-brand-500 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
  }`;
}