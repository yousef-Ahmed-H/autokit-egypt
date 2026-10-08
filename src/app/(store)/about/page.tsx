import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import { CheckIcon, ShieldIcon, TruckIcon, WalletIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على AutoKit Egypt ومهمتنا في تجهيز سيارتك داخل مصر (مشروع تجريبي).",
};

const values = [
  { icon: ShieldIcon, title: "الجودة أولًا", text: "نختبر كل منتج قبل إضافته، ونرفض أي شيء غير مطابق." },
  { icon: WalletIcon, title: "سعر واضح", text: "لا رسوم مفاجئة — السعر المعروض هو السعر النهائي مع الشحن موضحًا." },
  { icon: TruckIcon, title: "توصيل سريع", text: "شبكة توصيل تغطي كل محافظات مصر خلال أيام." },
];

export default function AboutPage() {
  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">من نحن</li>
        </ol>
      </nav>

      <header className="max-w-3xl">
        <p className="eyebrow mb-1.5">تعرّف علينا</p>
        <h1 className="h-section">من نحن</h1>
        <p className="mt-3 text-sm leading-8 text-ink-600">
          AutoKit Egypt هو متجر متخصص في إكسسوارات وتجهيزات السيارات داخل مصر: حوامل الموبايل،
          الشواحن والكابلات، منتجات العناية والنظافة، ومستلزمات التنظيم وأدوات الطريق.
          هدفنا نجعل تجربة القيادة اليومية أسهل وأكثر أمانًا وترتيبًا.
        </p>
        <p className="mt-3"><span className="demo-tag">هذا المشروع تجريبي — البيانات والأسعار والآراء للعرض فقط</span></p>
      </header>

      <section aria-labelledby="mission" className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 id="mission" className="text-base font-extrabold text-ink-950">مهمتنا</h2>
          <ul className="mt-4 space-y-3">
            {[
              "توفير إكسسوارات عملية بأسعار عادلة ومناسبة للاستخدام اليومي.",
              "شرح واضح لكل منتج: المواصفات، طريقة الاستخدام، والتوافق.",
              "تجربة شراء بسيطة من الموبايل: خطوات قليلة ودفع عند الاستلام.",
              "بناء علاقة طويلة مع العميل عبر دعم سريع على واتساب.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-7 text-ink-600">
                <CheckIcon width={16} height={16} className="mt-1.5 shrink-0 text-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">قيمنا</h2>
          <ul className="mt-4 space-y-4">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-950 text-brand-400">
                  <Icon width={20} height={20} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink-900">{title}</p>
                  <p className="mt-0.5 text-[0.82rem] leading-6 text-ink-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading eyebrow="خطواتنا" title="كيف نعمل؟" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "اختيار المنتجات", d: "ندرس احتياج السائق المصري ونختار الأكثر فائدة." },
            { t: "فحص الجودة", d: "نتأكد من الخامة والتغليف قبل العرض." },
            { t: "أسعار تنافسية", d: "نتعامل مباشرة لتقليل سعر البيع النهائي." },
            { t: "دعم بعد البيع", d: "متابعة الطلب والاستبدال عند اللزوم." },
          ].map((step, i) => (
            <li key={step.t} className="card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <p className="mt-3 text-sm font-extrabold text-ink-950">{step.t}</p>
              <p className="mt-1 text-[0.82rem] leading-6 text-ink-500">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 card flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <CheckIcon width={18} height={18} className="text-brand-500" /> جاهز تبدأ تجهيز سيارتك؟
        </p>
        <div className="flex gap-2">
          <Link href="/products" className="btn btn-primary">تصفّح المنتجات</Link>
          <Link href="/contact" className="btn btn-outline">تواصل معنا</Link>
        </div>
      </div>
    </div>
  );
}