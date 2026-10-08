import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { can } from "@/lib/admin/permissions";
import { ROLE_NAME } from "@/lib/admin/types";

/** تخطيط لوحة التحكم المحمي — لا يظهر لغير المشرفين */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const groups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(admin.role, item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-950 text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-xs text-white" aria-hidden>
              AK
            </span>
            لوحة التحكم
          </Link>

          <span className="rounded-md bg-white/10 px-2 py-1 text-[0.7rem] font-bold text-brand-300">
            {ROLE_NAME[admin.role]}
          </span>

          <div className="ms-auto flex flex-wrap items-center gap-2">
            <span className="hidden text-xs text-ink-300 sm:inline">{admin.name}</span>
            <Link href="/" className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/10">
              المتجر
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">
                خروج
              </button>
            </form>
          </div>
        </div>

        {/* تنقّل أفقي على الشاشات الصغيرة */}
        <nav aria-label="تنقّل لوحة التحكم (موبايل)" className="border-t border-white/10 lg:hidden">
          <ul className="flex gap-2 overflow-x-auto px-4 py-2">
            {groups.flatMap((group) =>
              group.items.map((item) => (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap rounded-lg border border-white/15 px-3 py-1.5 text-[0.72rem] font-bold text-ink-100 hover:bg-white/10"
                  >
                    <span aria-hidden>{item.icon} </span>
                    {item.label}
                  </Link>
                </li>
              )),
            )}
          </ul>
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-5 px-4 py-5">
        {/* الشريط الجانبي */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav aria-label="تنقّل لوحة التحكم" className="sticky top-24 space-y-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-2 text-[0.68rem] font-extrabold uppercase text-ink-400">{group.label}</p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.82rem] font-bold text-ink-700 hover:bg-white hover:text-brand-600"
                      >
                        <span aria-hidden>{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}