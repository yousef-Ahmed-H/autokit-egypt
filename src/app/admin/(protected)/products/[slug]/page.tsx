import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { getMergedProduct } from "@/lib/admin/product-overrides";
import { listCategories } from "@/lib/db/queries";
import { saveProductAction } from "@/app/admin/(protected)/products/actions";
import { formatFaqs, formatSpecs, joinLines } from "@/app/admin/(protected)/products/format";

export const metadata: Metadata = { title: "تعديل منتج" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePermission("products.view");
  const { slug } = await params;
  const { saved } = await searchParams;

  const product = await getMergedProduct(slug);
  if (!product) notFound();
  const categories = await listCategories();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/products" className="text-sm font-bold text-brand-600 hover:underline">
          ← كل المنتجات
        </Link>
        <h1 className="h-section">{product.name}</h1>
        <span className="rounded-md bg-ink-100 px-2 py-1 text-xs font-bold text-ink-600" dir="ltr">{product.slug}</span>
      </div>

      {saved === "1" && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          تم حفظ التعديلات.
        </p>
      )}

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-800">
        ⚠️ لا تُعرض المواصفات أو المحتوى للعميل كحقائق إلا بعد تفعيل خانات «تأكيد المشرف» بالأسفل.
        لا تُضِف مواصفات غير مؤكدة.
      </p>

      <form action={saveProductAction} className="space-y-5">
        <input type="hidden" name="slug" value={product.slug} />

        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">أساسيات</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="الاسم" name="name" defaultValue={product.name} required />
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink-700">التصنيف</span>
              <select name="category" defaultValue={product.category} className="field">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink-700">الحالة</span>
              <select name="status" defaultValue={product.status} className="field">
                <option value="active">منشور</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>
            </label>
            <Field label="SKU" name="sku" defaultValue={product.sku} dir="ltr" />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink-700" htmlFor="shortDescription">وصف مختصر</label>
              <input id="shortDescription" name="shortDescription" defaultValue={product.shortDescription} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-ink-700" htmlFor="description">الوصف الكامل</label>
              <textarea id="description" name="description" rows={5} defaultValue={product.description} className="field" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">التسعير والمخزون</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="السعر (ج.م)" name="price" type="number" defaultValue={String(product.price)} />
            <Field label="السعر قبل الخصم" name="oldPrice" type="number" defaultValue={product.oldPrice != null ? String(product.oldPrice) : ""} />
            <Field label="سعر التكلفة (أرباح — مخفي)" name="costPrice" type="number" defaultValue={product.costPrice != null ? String(product.costPrice) : ""} />
            <Field label="المخزون" name="stock" type="number" defaultValue={String(product.stock)} />
            <Field label="الحد الأدنى للمخزون" name="minStock" type="number" defaultValue={String(product.minStock)} />
            <Field label="الوزن (كجم)" name="weightKg" type="number" defaultValue={String(product.weightKg)} />
            <Field label="الأبعاد" name="dimensions" defaultValue={product.dimensions} />
            <Field label="اللون" name="color" defaultValue={product.color} />
            <Field label="الخامة" name="material" defaultValue={product.material} />
            <Field label="شارة (اختياري)" name="badge" defaultValue={product.badge ?? ""} />
            <Field label="الضمان" name="warranty" defaultValue={product.warranty} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">المحتوى (سطر لكل عنصر)</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Area label="المميزات" name="features" defaultValue={joinLines(product.features)} />
            <Area label="طريقة الاستخدام" name="usage" defaultValue={joinLines(product.usage)} />
            <Area label="محتويات العبوة" name="packageIncludes" defaultValue={joinLines(product.packageIncludes)} />
            <Area label="التوافق" name="compatibility" defaultValue={joinLines(product.compatibility)} />
            <Area label="التحذيرات" name="warnings" defaultValue={joinLines(product.warnings)} />
            <Area label="المواصفات (الاسم | القيمة)" name="specs" defaultValue={formatSpecs(product.specs)} />
            <Area label="أسئلة شائعة (سؤال | إجابة)" name="faqs" defaultValue={formatFaqs(product.faqs)} />
            <Field label="رابط فيديو (اختياري)" name="videoUrl" defaultValue={product.videoUrl ?? ""} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-extrabold text-ink-950">تأكيد المشرف</h2>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="verifiedSpecs" defaultChecked={!!product.verifiedSpecs} />
              تأكيد صحة المواصفات
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="verifiedContent" defaultChecked={!!product.verifiedContent} />
              تأكيد صحة المحتوى (استخدام/تحذيرات/توافق)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="verifiedStats" defaultChecked={!!product.verifiedStats} />
              تأكيد التقييمات/المبيعات المعروضة
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary">حفظ التعديلات</button>
          <Link href="/admin/media" className="btn btn-outline">إدارة الصور</Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  dir,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-ink-700" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        dir={dir ?? (type === "number" ? "ltr" : undefined)}
        className="field"
      />
    </div>
  );
}

function Area({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-ink-700" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={4} defaultValue={defaultValue} className="field" />
    </div>
  );
}