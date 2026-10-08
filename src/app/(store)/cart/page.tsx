import Link from "next/link";
import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "راجع منتجاتك قبل إتمام الطلب.",
};

export default function CartPage() {
  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-5 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">سلة التسوق</li>
        </ol>
      </nav>

      <h1 className="h-section mb-6">سلة التسوق</h1>

      <CartView />
    </div>
  );
}
