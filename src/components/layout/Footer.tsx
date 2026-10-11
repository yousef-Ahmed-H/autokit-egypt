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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 shrink-0 text-brand-400">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("مرحبًا، أريد الاستفسار عن منتجات AutoKit Egypt.")}`} className="hover:text-brand-400" target="_blank" rel="noopener noreferrer" dir="ltr">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <PinIcon className="mt-0.5 shrink-0 text-brand-400" />
              <span>{siteConfig.address}</span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-6 text-ink-400">
            للتواصل عبر الواتساب مباشرة
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