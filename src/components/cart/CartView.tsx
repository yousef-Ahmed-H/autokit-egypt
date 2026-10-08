"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import CouponForm from "@/components/cart/CouponForm";
import { CartIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

export default function CartView() {
  const { resolvedLines, count, totals, hydrated, setQuantity, remove, clear } = useCart();
  const [notice, setNotice] = useState<string | null>(null);

  function change(slug: string, quantity: number) {
    const result = setQuantity(slug, quantity);
    if (!result.ok && result.message) {
      setNotice(result.message);
      window.setTimeout(() => setNotice(null), 2500);
    }
  }

  if (!hydrated) {
    return <div className="card p-8 text-center text-sm text-ink-500">جارٍ تحميل السلة…</div>;
  }

  if (resolvedLines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-50 text-ink-400">
          <CartIcon width={26} height={26} />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-ink-950">سلتك فاضية</h2>
        <p className="mt-2 text-sm text-ink-500">ابدأ التسوّق وأضف منتجاتك المفضلة.</p>
        <Link href="/products" className="btn btn-primary mt-5">
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="منتجات السلة" className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h2 className="text-sm font-extrabold text-ink-950">المنتجات ({count})</h2>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-bold text-ink-400 hover:text-red-600"
          >
            إفراغ السلة
          </button>
        </div>

        {notice && (
          <p role="status" className="bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
            {notice}
          </p>
        )}

        <ul className="divide-y divide-ink-100">
          {resolvedLines.map((line) => {
            const product = line.product;
            if (!product) return null;

            return (
              <li key={line.slug} className="flex flex-wrap gap-4 p-4">
                <Link href={`/products/${product.slug}`} className="shrink-0" aria-label={product.name}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-[84px] rounded-lg border border-ink-100 bg-ink-50 object-contain p-1"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block font-extrabold text-ink-950 hover:text-brand-600"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink-400">
                    {formatPrice(product.price)} للقطعة · {product.sku}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border border-ink-200">
                      <button
                        type="button"
                        onClick={() => change(line.slug, line.quantity - 1)}
                        className="h-9 w-9 font-bold text-ink-600 hover:bg-ink-50"
                        aria-label={`إنقاص كمية ${product.name}`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => change(line.slug, line.quantity + 1)}
                        disabled={line.atMax}
                        className="h-9 w-9 font-bold text-ink-600 hover:bg-ink-50 disabled:opacity-40"
                        aria-label={`زيادة كمية ${product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[0.7rem] font-semibold text-ink-400">
                      {line.unavailable
                        ? "نفد المخزون — سيُحذف عند الطلب"
                        : `الحد الأقصى: ${line.max}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => remove(line.slug)}
                      className="text-xs font-bold text-ink-400 hover:text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <div className="ms-auto text-end">
                  <span className="block font-extrabold text-ink-950">{formatPrice(line.lineTotal)}</span>
                  {charOrNothing(line.quantity, product.stock)}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside aria-label="ملخص الطلب" className="lg:sticky lg:top-32 lg:h-fit">
        <div className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">ملخص الطلب</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">الإجمالي الفرعي</dt>
              <dd className="font-bold text-ink-900">{formatPrice(totals.subtotal)}</dd>
            </div>

            {totals.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <dt>الخصم ({totals.couponCode})</dt>
                <dd className="font-bold">− {formatPrice(totals.discount)}</dd>
              </div>
            )}

            <div className="flex items-center justify-between">
              <dt className="text-ink-500">تكلفة الشحن</dt>
              <dd className="font-bold text-ink-900">
                {totals.subtotal <= 0
                  ? "—"
                  : totals.shipping === 0
                    ? "مجاني"
                    : formatPrice(totals.shipping)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <dt className="font-extrabold text-ink-950">الإجمالي النهائي</dt>
              <dd className="text-lg font-extrabold text-brand-600">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          {remainingForFreeShipping > 0 && (
            <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-[0.72rem] font-semibold text-ink-500">
              أضف {formatPrice(remainingForFreeShipping)} للحصول على شحن مجاني (فوق {formatPrice(FREE_SHIPPING_THRESHOLD)}).
            </p>
          )}

          <CouponForm />

          <Link href="/checkout" className="btn btn-primary mt-5 w-full">
            إتمام الطلب (الدفع عند الاستلام)
          </Link>
          <Link href="/products" className="btn btn-outline mt-2 w-full">
            متابعة التسوّق
          </Link>

          <p className="mt-4 text-[0.72rem] leading-6 text-ink-400">
            هذه نسخة تجريبية: لا تتم أي عملية دفع إلكتروني، والشحن يُحسب تقديريًا (تجريبي).
          </p>
        </div>
      </aside>
    </div>
  );
}

/** ملاحظة صغيرة عند بلوغ حد المخزون */
function charOrNothing(quantity: number, stock: number) {
  if (quantity < stock) return null;
  return <span className="mt-1 block text-[0.68rem] font-bold text-amber-600">وصلت للحد المتاح</span>;
}