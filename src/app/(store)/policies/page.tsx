import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "السياسات",
  description: "سياسات الشحن والاسترجاع والخصوصية والشروط والأحكام",
};

export default function PoliciesIndexPage() {
  const links = [
    { href: "/policies/shipping", label: "سياسة الشحن والتوصيل" },
    { href: "/policies/returns", label: "سياسة الاستبدال والاسترجاع" },
    { href: "/policies/privacy", label: "سياسة الخصوصية" },
    { href: "/policies/terms", label: "الشروط والأحكام" },
  ];
  return (
    <section className="section container">
      <header>
        <p className="eyebrow">معلومات</p>
        <h1 className="h-section">السياسات</h1>
      </header>
      <div className="mt-4 card p-4">
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="font-bold text-brand-600 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}