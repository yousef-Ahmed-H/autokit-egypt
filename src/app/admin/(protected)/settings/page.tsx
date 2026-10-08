import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "الإعدادات" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission("settings.view");

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">النظام</p>
        <h1 className="h-section">الإعدادات</h1>
        <p className="mt-1 text-sm text-ink-500">
          إعدادات المتجر (اسم الموقع، العملة، إعدادات الشحن الافتراضية) تُدار عبر متغيرات البيئة حالياً. عند ربط Supabase سيتم تحريكها إلى جدول إعدادات.
        </p>
      </header>

      <div className="card p-5 text-sm text-ink-600">
        يُرجى مراجعة <code>.env.example</code> للتأكد من ضبط المتغيرات في الإنتاج (مثل <code>ADMIN_SESSION_SECRET</code> و<code>NEXT_PUBLIC_SITE_URL</code>).
      </div>
    </div>
  );
}