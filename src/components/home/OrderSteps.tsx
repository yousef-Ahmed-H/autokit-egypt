import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  { n: "01", title: "اختر منتجاتك", text: "تصفّح الأقسام أو استخدم البحث للوصول للمنتج المناسب." },
  { n: "02", title: "أضف إلى السلة", text: "راجع الكميات والأسعار داخل صفحة السلة." },
  { n: "03", title: "أدخل بيانات التوصيل", text: "الاسم، رقم الهاتف، المحافظة، والعنوان بالتفصيل." },
  { n: "04", title: "استلم وادفع", text: "يصلك الطلب لباب البيت وتدفع عند الاستلام." },
];

export default function OrderSteps() {
  return (
    <section aria-labelledby="steps-title" className="container-x section-y">
      <SectionHeading
        eyebrow="طريقة الطلب"
        title="4 خطوات بس"
        description="الطلب يتم من الموبايل بدون حساب، ويتواصل معك فريقنا لتأكيد التفاصيل."
      />

      <ol id="steps-title" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <li key={step.n} className="card relative p-5">
            <span className="text-3xl font-extrabold text-brand-500">{step.n}</span>
            <h3 className="mt-3 text-[0.98rem] font-extrabold text-ink-950">{step.title}</h3>
            <p className="mt-2 text-[0.84rem] leading-7 text-ink-500">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/products" className="btn btn-primary">تسوق الآن</Link>
        <Link href="/faq" className="btn btn-outline">الأسئلة الشائعة</Link>
      </div>
    </section>
  );
}
