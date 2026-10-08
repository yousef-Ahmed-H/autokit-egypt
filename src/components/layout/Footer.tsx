import Link from "next/link";
import { categories } from "@/lib/data/products";
import { faqGroups } from "@/lib/data/content";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

const quickLinks = [
  { href: "/products", label: "كل المنتجات" },
  { href: "/#bundles", label: "الباقات" },
  { href: "/about", label: "من نحن" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/cart", label: "سلة التسوق" },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink-950 text-ink-200">
      <div className="container-x section-y grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* الهوية */}
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white font-extrabold text-sm">
              AK
            </span>
            <span className="font-extrabold text-white">AutoKit Egypt</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-300">
            متجر إكسسوارات السيارات داخل مصر — حوامل، شواحن، كابلات، عناية وتنظيم.
            الموقع حاليًا نسخة تجريبية ببيانات Demo.
          </p>
          <p className="mt-3">
            <span className="demo-tag">بيانات تجريبية</span>
          </p>
        </div>

        {/* روابط سريعة */}
        <nav aria-label="روابط سريعة">
          <h2 className="mb-4 text-sm font-extrabold text-white">روابط سريعة</h2>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-300 hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* الأقسام */}
        <nav aria-label="أقسام المنتجات">
          <h2 className="mb-4 text-sm font-extrabold text-white">الأقسام</h2>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="text-ink-300 hover:text-brand-400"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/faq#${faqGroups[0].id}`} className="text-ink-300 hover:text-brand-400">
                الشحن واستبدال المنتجات
              </Link>
            </li>
          </ul>
        </nav>

        {/* تواصل */}
        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">تواصل معنا</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <PhoneIcon className="mt-0.5 shrink-0 text-brand-400" />
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-brand-400" dir="ltr">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MailIcon className="mt-0.5 shrink-0 text-brand-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-brand-400" dir="ltr">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <PinIcon className="mt-0.5 shrink-0 text-brand-400" />
              <span>القاهرة، جمهورية مصر العربية</span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-6 text-ink-400">
            أرقام وعناوين تجريبية لأغراض العرض فقط.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name} — جميع الحقوق محفوظة.</p>
          <p>العملة: الجنيه المصري (ج.م) · تصميم عربي RTL</p>
        </div>
      </div>
    </footer>
  );
}
