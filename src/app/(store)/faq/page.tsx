import Link from "next/link";
import type { Metadata } from "next";
import { faqGroups } from "@/lib/data/content";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن الشحن والدفع والاستبدال والطلبات في AutoKit Egypt (نسخة تجريبية).",
};

export default function FaqPage() {
  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-5 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand-600">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">الأسئلة الشائعة</li>
        </ol>
      </nav>

      <header className="max-w-2xl">
        <p className="eyebrow mb-1.5">مركز المساعدة</p>
        <h1 className="h-section">الأسئلة الشائعة</h1>
        <p className="mt-2 text-sm leading-7 text-ink-500">
          كل ما تحتاج معرفته عن الشحن، الدفع عند الاستلام، الاستبدال، ومتابعة الطلبات.
        </p>
        <p className="mt-3">
          <span className="demo-tag">الإجابات تجريبية وتُحدَّث عند تشغيل المتجر فعليًا</span>
        </p>
      </header>

      {/* روابط الأقسام */}
      <nav aria-label="أقسام الأسئلة" className="mt-6 flex flex-wrap gap-2">
        {faqGroups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-lg bg-ink-50 px-3 py-2 text-[0.82rem] font-bold text-ink-600 hover:bg-ink-100"
          >
            {group.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {faqGroups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-32">
            <h2 className="mb-3 text-base font-extrabold text-ink-950">{group.title}</h2>
            <div className="card divide-y divide-ink-100 overflow-hidden">
              {group.items.map((item) => (
                <details key={item.question} className="group px-4 py-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-[0.9rem] font-bold text-ink-800">
                    {item.question}
                    <span className="text-ink-300 transition-transform group-open:rotate-180" aria-hidden>
                      ⌄
                    </span>
                  </summary>
                  <p className="mt-2 text-[0.84rem] leading-7 text-ink-500">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="card mt-10 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-base font-extrabold text-ink-950">لسه عندك سؤال؟</h2>
          <p className="mt-1 text-[0.82rem] text-ink-500">فريق الدعم جاهز يساعدك على واتساب.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappLink("عندي سؤال عن منتجات AutoKit Egypt")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-[#25D366] text-white"
          >
            <WhatsAppIcon width={18} height={18} /> واتساب
          </a>
          <Link href="/contact" className="btn btn-outline">
            تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  );
}