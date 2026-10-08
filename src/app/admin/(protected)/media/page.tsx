import Image from "next/image";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import { listAllImages, listVideos, listProductImages } from "@/lib/media/store";
import { MAX_IMAGES_PER_PRODUCT, MIN_IMAGES_PER_PRODUCT } from "@/lib/media/types";
import {
  addVideoAction,
  deleteImageAction,
  deleteVideoAction,
  updateImageAction,
  uploadImageAction,
} from "@/app/admin/(protected)/media/actions";

export const metadata: Metadata = { title: "الصور والفيديو" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  main: "رئيسية",
  size: "الحجم",
  usage: "طريقة الاستخدام",
  gallery: "إضافية",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await requirePermission("media.view");
  const { ok, err } = await searchParams;
  const [products, images, videos] = await Promise.all([
    getMergedProducts(),
    listAllImages(),
    listVideos(),
  ]);

  const counts = await Promise.all(
    products.map(async (p) => ({ slug: p.slug, count: (await listProductImages(p.slug)).length })),
  );
  const countMap = new Map(counts.map((c) => [c.slug, c.count]));

  const groups = products
    .map((p) => ({ product: p, images: images.filter((i) => i.productSlug === p.slug) }))
    .filter((g) => g.images.length > 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">الكتالوج</p>
        <h1 className="h-section">الصور والفيديو</h1>
        <p className="mt-1 text-sm text-ink-500">
          ارفع 3–6 صور لكل منتج بصيغة JPG/PNG/WebP/AVIF. تُحوَّل تلقائيًا إلى WebP مع صورة مصغّرة، وتُرفض الملفات غير الآمنة (SVG/HTML/سكريبت).
        </p>
      </header>

      {ok && <Notice tone="ok">{ok}</Notice>}
      {err && <Notice tone="error">{err}</Notice>}

      <section className="card p-5">
        <h2 className="text-sm font-extrabold text-ink-950">رفع صورة جديدة</h2>
        <form action={uploadImageAction} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="label">المنتج</span>
            <select name="productSlug" required className="field">
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({countMap.get(p.slug) ?? 0}/{MAX_IMAGES_PER_PRODUCT})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">نوع الصورة</span>
            <select name="kind" defaultValue="main" className="field">
              <option value="main">رئيسية</option>
              <option value="size">الحجم</option>
              <option value="usage">طريقة الاستخدام</option>
              <option value="gallery">إضافية</option>
            </select>
          </label>
          <label className="block">
            <span className="label">نوع المصدر</span>
            <select name="sourceType" defaultValue="real" className="field">
              <option value="real">صورة حقيقية</option>
              <option value="illustrative">توضيحية (AI/رسم)</option>
            </select>
          </label>
          <label className="block">
            <span className="label">نص بديل بالعربية (Alt)</span>
            <input name="altAr" required className="field" placeholder="مثال: حامل موبايل مثبّت على فتحة التكييف" />
          </label>
          <label className="block">
            <span className="label">مصدر الصورة</span>
            <input name="source" required className="field" placeholder="مثال: تصوير المتجر 2026" />
          </label>
          <label className="block">
            <span className="label">الملف (من الهاتف/الكمبيوتر)</span>
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="field" />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="btn btn-primary">رفع الصورة</button>
          </div>
        </form>
        <p className="mt-3 text-xs text-ink-400">الحد الأقصى {MAX_IMAGES_PER_PRODUCT} صور لكل منتج، والحد الأدنى الموصى به {MIN_IMAGES_PER_PRODUCT}.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-ink-950">الصور الحالية</h2>
        {groups.length === 0 && <Notice tone="info">لا توجد صور مرفوعة بعد — الصور الظاهرة حاليًا هي Placeholders تجريبية.</Notice>}
        {groups.map(({ product, images: list }) => (
          <div key={product.slug} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink-900">{product.name}</h3>
              <span className="text-xs font-bold text-ink-400" dir="ltr">{product.slug}</span>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((image) => (
                <div key={image.id} className="rounded-xl border border-ink-100 p-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-50">
                    <Image src={image.thumbUrl} alt={image.altAr} fill sizes="240px" className="object-cover" />
                  </div>
                  <p className="mt-2 text-[0.7rem] font-bold text-ink-500">
                    {KIND_LABEL[image.kind]} — {image.width}×{image.height} — {Math.round(image.bytes / 1024)}KB
                  </p>
                  <form action={updateImageAction} className="mt-2 space-y-2">
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="productSlug" value={product.slug} />
                    <input name="altAr" defaultValue={image.altAr} className="field" placeholder="نص Alt" />
                    <input name="source" defaultValue={image.source} className="field" placeholder="المصدر" />
                    <div className="flex gap-2">
                      <select name="kind" defaultValue={image.kind} className="field">
                        <option value="main">رئيسية</option>
                        <option value="size">الحجم</option>
                        <option value="usage">استخدام</option>
                        <option value="gallery">إضافية</option>
                      </select>
                      <select name="sourceType" defaultValue={image.sourceType} className="field">
                        <option value="real">حقيقية</option>
                        <option value="illustrative">توضيحية</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-outline w-full">حفظ الوصف</button>
                  </form>
                  <form action={deleteImageAction} className="mt-2">
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="productSlug" value={product.slug} />
                    <button type="submit" className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                      حذف الصورة
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-extrabold text-ink-950">إضافة فيديو (رابط)</h2>
        <form action={addVideoAction} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="label">المنتج</span>
            <select name="productSlug" required className="field">
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">رابط الفيديو</span>
            <input name="url" required dir="ltr" className="field" placeholder="https://..." />
          </label>
          <label className="block">
            <span className="label">عنوان الفيديو</span>
            <input name="title" className="field" />
          </label>
          <label className="block">
            <span className="label">المصدر</span>
            <input name="source" required className="field" />
          </label>
          <label className="block">
            <span className="label">نوع المصدر</span>
            <select name="sourceType" defaultValue="real" className="field">
              <option value="real">حقيقي</option>
              <option value="illustrative">توضيحي</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="btn btn-primary">إضافة الفيديو</button>
          </div>
        </form>
        {videos.length > 0 && (
          <ul className="mt-4 divide-y divide-ink-100">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-bold text-ink-800">{v.title || v.url}</span>
                <form action={deleteVideoAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="productSlug" value={v.productSlug} />
                  <button type="submit" className="text-xs font-bold text-red-600 hover:underline">حذف</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Notice({ tone, children }: { tone: "ok" | "error" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "error"
        ? "bg-red-50 text-red-700"
        : "bg-ink-100 text-ink-600";
  return <p role="status" className={`rounded-lg px-3 py-2 text-sm font-bold ${cls}`}>{children}</p>;
}