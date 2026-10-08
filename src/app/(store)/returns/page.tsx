import type { Metadata } from "next";
import ReturnRequestForm from "@/components/returns/ReturnRequestForm";

export const metadata: Metadata = {
  title: "طلب استرجاع أو استبدال",
  description: "أرسل طلب استرجاع/استبدال مع سبب واضح وصور إن وُجدت",
};

export default function ReturnsRequestPage() {
  return (
    <section className="section container max-w-[720px]">
      <header>
        <p className="eyebrow">المرتجعات</p>
        <h1 className="h-section">طلب استرجاع أو استبدال</h1>
        <p className="mt-1 text-sm text-ink-500">
          راجع <a href="/policies/returns" className="font-bold text-brand-600 hover:underline">سياسة الاسترجاع والاستبدال</a> قبل إرسال الطلب.
        </p>
      </header>
      <div className="mt-4">
        <ReturnRequestForm />
      </div>
    </section>
  );
}