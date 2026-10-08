import Link from "next/link";
import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "إتمام الطلب بالدفع عند الاستلام داخل مصر (نسخة تجريبية).",
};

export default function CheckoutPage() {
  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li><Link href="/cart" className="hover:text-brand-600">السلة</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">إتمام الطلب</li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="h-section">إتمام الطلب</h1>
        <p className="mt-2 text-sm text-ink-500">
          الدفع عند الاستلام فقط — لا يوجد دفع إلكتروني في النسخة التجريبية.
        </p>
        <p className="mt-3"><span className="demo-tag">طلب تجريبي — لا يتم إرسال أي بيانات لشركة شحن</span></p>
      </header>

      <CheckoutForm />
    </div>
  );
}