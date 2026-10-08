"use client";

import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { useFavorites } from "@/components/favorites/favorites-context";

export default function FavoritesView() {
  const { products, count, hydrated, clear } = useFavorites();

  if (!hydrated) {
    return <div className="card p-8 text-center text-sm text-ink-500">جارٍ التحميل…</div>;
  }

  if (count === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-50 text-2xl text-ink-400" aria-hidden>
          ♡
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-ink-950">لا توجد منتجات في المفضلة</h2>
        <p className="mt-2 text-sm text-ink-500">
          اضغط على القلب في أي منتج لإضافته هنا (تُحفظ المفضلة على جهازك).
        </p>
        <Link href="/products" className="btn btn-primary mt-5">تصفّح المنتجات</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">{count} منتج في المفضلة</p>
        <button type="button" onClick={clear} className="text-xs font-bold text-ink-400 hover:text-red-600">
          إفراغ المفضلة
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}