import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { reviews as demoReviews } from "@/lib/data/content";
import { can } from "@/lib/admin/permissions";
import { deleteReviewAction } from "@/app/admin/(protected)/reviews/actions";

export const metadata: Metadata = { title: "التقييمات" };
export const dynamic = "force-dynamic";

async function readCustom(): Promise<any[]> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const file = path.join(process.cwd(), ".data", "reviews.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const admin = await requirePermission("reviews.view");
  const custom = await readCustom();
  const all = [...custom, ...demoReviews].filter((r, i, arr) => arr.findIndex((x: any) => x.id === r.id) === i);
  const canManage = can(admin.role, "reviews.manage");

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">الكتالوج</p>
        <h1 className="h-section">التقييمات</h1>
        <p className="mt-1 text-sm text-ink-500">
          التقييمات التجريبية معروضة لغرض الشكل فقط، ولا تُعرض في واجهة المتجر النهائية إلا إن تحقّق عنصر «تأكيد المشرف» من صفحة المنتج.
        </p>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[660px] text-sm">
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">المؤلف</th>
              <th scope="col" className="p-3 text-start">المدينة</th>
              <th scope="col" className="p-3 text-start">التقييم</th>
              <th scope="col" className="p-3 text-start">المنتج</th>
              <th scope="col" className="p-3 text-start">النص</th>
              <th scope="col" className="p-3 text-start"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {all.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-bold">{r.author}</td>
                <td className="p-3">{r.city}</td>
                <td className="p-3" dir="ltr">{r.rating}/5</td>
                <td className="p-3">{r.productSlug ?? "عام"}</td>
                <td className="p-3 max-w-[360px] truncate">{r.text}</td>
                <td className="p-3">
                  {canManage && custom.some((x: any) => x.id === r.id) && (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-xs font-bold text-red-600 hover:underline">حذف</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}