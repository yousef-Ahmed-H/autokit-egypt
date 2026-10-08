import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/app/admin/login/LoginForm";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { DEMO_ACCOUNTS } from "@/lib/admin/users-store";

export const metadata: Metadata = {
  title: "دخول لوحة التحكم",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const showDemo = process.env.NODE_ENV !== "production" && process.env.ADMIN_SHOW_DEMO !== "false";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 p-4">
      <div className="w-full max-w-sm">
        <LoginForm />

        {showDemo && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-ink-900 p-4 text-white" dir="rtl">
            <p className="text-xs font-extrabold text-amber-400">حسابات تجريبية لاختبار الأدوار (Demo)</p>
            <ul className="mt-2 space-y-1 text-[0.72rem] leading-6 text-ink-300">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email} className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white" dir="ltr">{acc.email}</span>
                  <span dir="ltr">{acc.password}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.68rem] text-ink-400">
              تُعرض الحسابات التجريبية في وضع التطوير فقط. عطّلها عبر <code dir="ltr">ADMIN_SHOW_DEMO=false</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}