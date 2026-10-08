import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة (404)",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-x section-y">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-6xl font-extrabold text-brand-500" aria-hidden>
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-950">الصفحة غير موجودة</h1>
        <p className="mt-3 text-sm leading-7 text-ink-500">
          الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله. تقدر ترجع للصفحة الرئيسية أو تتصفح المنتجات.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary">الصفحة الرئيسية</Link>
          <Link href="/products" className="btn btn-outline">تصفّح المنتجات</Link>
          <Link href="/track" className="btn btn-outline">تتبع طلبك</Link>
        </div>

        <div className="mt-10 text-start">
          <p className="mb-3 text-sm font-extrabold text-ink-950">روابط سريعة</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/products?sort=popular", label: "الأكثر مبيعًا" },
              { href: "/products?sort=newest", label: "أحدث المنتجات" },
              { href: "/faq", label: "الأسئلة الشائعة" },
              { href: "/contact", label: "تواصل معنا" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg border border-ink-100 px-4 py-3 text-sm font-bold text-ink-700 hover:border-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}