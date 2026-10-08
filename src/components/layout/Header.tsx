"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useFavorites } from "@/components/favorites/favorites-context";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/#bundles", label: "الباقات" },
  { href: "/about", label: "من نحن" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/track", label: "تتبع طلبك" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // إغلاق القائمة عند التنقل
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // منع التمرير خلف القائمة المفتوحة
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <>
      {/* شريط تنبيه: بيانات تجريبية */}
      <div className="bg-ink-950 text-ink-200 text-[0.78rem] sm:text-sm">
        <div className="container-x py-2 flex items-center justify-center gap-2 text-center">
          <span className="demo-tag">تجريبي</span>
          <span>نسخة عرض — المنتجات والأسعار بيانات تجريبية وليست للبيع حاليًا.</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="container-x flex h-16 items-center gap-3">
          {/* زر القائمة (موبايل) */}
          <button
            type="button"
            className="lg:hidden -ms-1 grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-800"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* الشعار المؤقت */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${siteConfig.name} — الصفحة الرئيسية`}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white font-extrabold text-sm">
              AK
            </span>
            <span className="leading-tight">
              <span className="block text-[0.98rem] font-extrabold text-ink-950">AutoKit Egypt</span>
              <span className="block text-[0.68rem] font-semibold text-ink-400">إكسسوارات سيارات</span>
            </span>
          </Link>

          {/* البحث (سطح المكتب) */}
          <form onSubmit={onSearch} role="search" className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <input
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن حامل موبايل، شاحن، كابل..."
                aria-label="بحث في المنتجات"
                className="field ps-10"
              />
              <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto text-ink-400" />
              <button type="submit" className="sr-only">بحث</button>
            </div>
          </form>

          {/* المفضلة */}
          <Link
            href="/favorites"
            className="hidden sm:grid relative h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-800 hover:border-ink-900"
            aria-label="المفضلة"
          >
            <FavoriteNavIcon />
            {favCount > 0 && (
              <span className="absolute -top-2 -end-2 grid min-w-5 place-items-center rounded-full bg-ink-950 px-1 text-[0.68rem] font-bold text-white">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>

          {/* السلة */}
          <Link
            href="/cart"
            className="relative ms-auto md:ms-0 grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-800 hover:border-ink-900"
            aria-label={`السلة (${count} منتج)`}
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-2 -end-2 grid min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[0.68rem] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>

        {/* التنقل (سطح المكتب) */}
        <nav aria-label="التنقل الرئيسي" className="hidden lg:block border-t border-ink-100">
          <ul className="container-x flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2.5 text-sm font-bold transition-colors ${
                    pathname === link.href
                      ? "text-brand-600"
                      : "text-ink-600 hover:text-ink-950"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="ms-auto py-1.5">
              <span className="demo-tag">بيانات Demo</span>
            </li>
          </ul>
        </nav>
      </header>

      {/* قائمة الموبايل */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-[82%] max-w-xs bg-white shadow-xl flex flex-col">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
              <span className="font-extrabold text-ink-950">القائمة</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={onSearch} role="search" className="border-b border-ink-100 p-4">
              <div className="relative">
                <input
                  type="search"
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في المنتجات..."
                  aria-label="بحث في المنتجات"
                  className="field ps-10"
                />
                <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto text-ink-400" />
              </div>
            </form>

            <nav aria-label="قائمة الموبايل" className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-3 py-3 text-[0.95rem] font-bold ${
                        pathname === link.href
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-700 hover:bg-ink-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-ink-100 p-4 text-xs text-ink-400">
              {siteConfig.name} — نسخة تجريبية
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** قلب صغير لزر المفضلة في الهيدر */
function FavoriteNavIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20s-7-4.3-7-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 2.9c0 5-7 9.5-7 9.5Z" />
    </svg>
  );
}
