import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listPolicies } from "@/lib/content/store";
import { savePolicyAction } from "@/app/admin/(protected)/policies/actions";

export const metadata: Metadata = { title: "السياسات" };
export const dynamic = "force-dynamic";

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requirePermission("content.manage");
  const { ok } = await searchParams;
  const policies = await listPolicies();

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">المحتوى</p>
        <h1 className="h-section">السياسات</h1>
        <p className="mt-1 text-sm text-ink-500">تُعرض صفحات /policies/* بناءً على هذا المحتوى.</p>
      </header>

      {ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{ok}</p>}

      <div className="space-y-4">
        {policies.map((p) => (
          <form key={p.slug} action={savePolicyAction} className="card space-y-3 p-5">
            <input type="hidden" name="slug" value={p.slug} />
            <h2 className="text-sm font-extrabold text-ink-950">{p.title}</h2>
            <label className="block">
              <span className="label">العنوان</span>
              <input name="title" defaultValue={p.title} className="field" />
            </label>
            <label className="block">
              <span className="label">المحتوى (فقرات مفصولة بسطر فارغ)</span>
              <textarea name="body" rows={6} defaultValue={p.body} className="field" />
            </label>
            <button type="submit" className="btn btn-primary">حفظ السياسة</button>
          </form>
        ))}
      </div>
    </div>
  );
}