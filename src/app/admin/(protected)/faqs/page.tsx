import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listContentFaqs } from "@/lib/content/store";
import { addFaqGroupAction, saveFaqsAction } from "@/app/admin/(protected)/faqs/actions";

export const metadata: Metadata = { title: "الأسئلة الشائعة" };
export const dynamic = "force-dynamic";

function fmtItems(items: { question: string; answer: string }[]): string {
  return items.map((i) => `${i.question} | ${i.answer}`).join("\n");
}

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requirePermission("content.manage");
  const { ok } = await searchParams;
  const groups = await listContentFaqs();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">المحتوى</p>
          <h1 className="h-section">الأسئلة الشائعة</h1>
        </div>
        <form action={addFaqGroupAction} className="flex flex-wrap items-center gap-2">
          <input name="title" className="field w-40" placeholder="عنوان المجموعة" />
          <button type="submit" className="btn btn-outline">إضافة مجموعة</button>
        </form>
      </header>

      {ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{ok}</p>}

      <form action={saveFaqsAction} className="space-y-4">
        {groups.map((g) => (
          <section key={g.id} className="card p-5">
            <label className="block">
              <span className="label">عنوان المجموعة</span>
              <input name={`title_${g.id}`} defaultValue={g.title} className="field" />
            </label>
            <label className="mt-3 block">
              <span className="label">الأسئلة (سؤال | إجابة — سطر لكل سؤال)</span>
              <textarea name={`items_${g.id}`} rows={5} defaultValue={fmtItems(g.items)} className="field" />
            </label>
          </section>
        ))}
        <button type="submit" className="btn btn-primary">حفظ الأسئلة الشائعة</button>
      </form>
    </div>
  );
}