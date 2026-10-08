import Link from "next/link";
import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق AutoKit Egypt عبر واتساب أو الهاتف أو نموذج الرسائل.",
};

export default function ContactPage() {
  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand-600">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">تواصل معنا</li>
        </ol>
      </nav>

      <header>
        <p className="eyebrow mb-1.5">خدمة العملاء</p>
        <h1 className="h-section">تواصل معنا</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-500">
          عندك سؤال عن منتج أو ملاحظة على طلب؟ اكتب لنا هنا أو أرسل واتساب، وهنرد عليك في أسرع وقت.
        </p>
        <p className="mt-3">
          <span className="demo-tag">بيانات تواصل تجريبية — الرسائل تُحفظ محليًا للعرض فقط</span>
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-950">بيانات التواصل</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <WhatsAppIcon width={18} height={18} />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:text-brand-600"
                >
                  واتساب (رقم تجريبي)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon width={18} height={18} />
                <span dir="ltr">{siteConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MailIcon width={18} height={18} />
                <span dir="ltr">{siteConfig.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <PinIcon width={18} height={18} />
                <span>القاهرة — جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-950">قبل ما تكلمنا</h2>
            <p className="mt-3 text-[0.82rem] leading-7 text-ink-500">
              جرّب صفحة{" "}
              <Link href="/faq" className="font-bold text-brand-600 underline">
                الأسئلة الشائعة
              </Link>{" "}
              — فيها إجابات عن الشحن والدفع والاستبدال، ولو لسه عندك سؤال تواصل معنا مباشرة.
            </p>
            <Link href="/track" className="btn btn-outline mt-4 w-full">
              تتبع طلبك
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}