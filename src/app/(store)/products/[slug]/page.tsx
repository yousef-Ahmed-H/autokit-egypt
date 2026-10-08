import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import ProductGallery from "@/components/products/ProductGallery";
import ProductPurchase from "@/components/products/ProductPurchase";
import FavoriteButton from "@/components/products/FavoriteButton";
import Rating from "@/components/ui/Rating";
import { WhatsAppIcon } from "@/components/ui/icons";
import { STOCK_LABEL, stockStatus } from "@/lib/data/products";
import {
  getAllProducts,
  getCategoryBySlug,
  getProduct,
  getRelatedProducts,
} from "@/lib/db/queries";
import { discountPercent, formatNumber, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

type Params = { slug: string };

export async function generateStaticParams() {
  const all = await getAllProducts();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "منتج غير موجود" };
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductDetailsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const status = stockStatus(product);
  const off = product.oldPrice ? discountPercent(product.price, product.oldPrice) : 0;
  const related = await getRelatedProducts(product, 4);
  const category = await getCategoryBySlug(product.category);

  // الصور: استخدم صور لوحة التحكم إن وُجدت، وإلا Placeholders
  const galleryImages =
    product.media && product.media.length > 0
      ? product.media.map((m) => m.url)
      : product.images;

  const fullSpecs = [
    { label: "كود المنتج (SKU)", value: product.sku },
    { label: "التصنيف", value: category?.name ?? "" },
    {
      label: "حالة المنتج",
      value:
        product.status === "active"
          ? "متاح للبيع"
          : product.status === "draft"
            ? "مسودة"
            : "مؤرشف",
    },
    { label: "حالة المخزون", value: `${STOCK_LABEL[status]} (${product.stock} قطعة)` },
    { label: "الوزن", value: `${product.weightKg} كجم` },
    { label: "الأبعاد", value: product.dimensions },
    { label: "اللون", value: product.color },
    { label: "الخامة", value: product.material },
    ...product.specs,
  ].filter((s) => s.value);

  const showStats = product.verifiedStats === true;

  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-5 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li><Link href="/products" className="hover:text-brand-600">المنتجات</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <ProductGallery images={galleryImages} alt={product.name} />
          {product.media && product.media.length > 0 && (
            <p className="mt-2 text-[0.7rem] leading-6 text-ink-400">
              نوع الصور: {product.media.some((m) => m.sourceType === "real") ? "صور حقيقية" : "صور توضيحية"}
              {" "}— الصور التوضيحية ليست دليلًا على المنتج الحقيقي. المصدر:{" "}
              {Array.from(new Set(product.media.map((m) => m.source).filter(Boolean))).join("، ") || "لوحة التحكم"}
              .
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && (
              <span className="rounded-md bg-ink-950 px-2 py-1 text-[0.7rem] font-bold text-white">{product.badge}</span>
            )}
            <span className="demo-tag">بيانات تجريبية</span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-ink-950 sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-xs font-semibold text-ink-400">كود المنتج: {product.sku}</p>

          {showStats ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Rating rating={product.rating} reviewsCount={product.reviewsCount} size={16} />
              <span className="text-xs text-ink-400">
                {formatNumber(product.salesCount)} عملية بيع
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-400">
              التقييمات وعدد المبيعات لا تُعرض إلا بعد تأكيدها من إدارة المتجر.
            </p>
          )}

          <p className="mt-4 text-sm leading-7 text-ink-600">{product.shortDescription}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-ink-50 p-4">
            <span className="text-3xl font-extrabold text-ink-950">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-sm text-ink-400 line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-md bg-brand-500 px-2 py-1 text-xs font-bold text-white">وفّر {off}%</span>
              </>
            )}
            <span
              className={`ms-auto text-xs font-bold ${
                status === "in_stock" ? "text-emerald-600" : status === "low_stock" ? "text-amber-600" : "text-red-600"
              }`}
            >
              {STOCK_LABEL[status]}
            </span>
          </div>

          <div className="mt-5">
            <ProductPurchase slug={product.slug} name={product.name} stock={product.stock} sku={product.sku} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <FavoriteButton slug={product.slug} variant="full" />
            <a
              href={whatsappLink(`استفسار عن ${product.name} (${product.sku})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <WhatsAppIcon width={18} height={18} /> واتساب
            </a>
          </div>
        </div>
      </div>

      {/* الوصف والمميزات */}
      <section aria-labelledby="details-title" className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 id="details-title" className="text-base font-extrabold text-ink-950">الوصف التفصيلي</h2>
          <p className="mt-3 text-sm leading-8 text-ink-600">{product.description}</p>

          {product.features.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-extrabold text-ink-950">المميزات</h3>
              <ul className="mt-3 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm leading-7 text-ink-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}

          {product.usage.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-extrabold text-ink-950">طريقة الاستخدام</h3>
              <ol className="mt-3 space-y-2">
                {product.usage.map((step, i) => (
                  <li key={step} className="flex items-start gap-2 text-sm leading-7 text-ink-600">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-950 text-[0.7rem] font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}

          {product.verifiedContent !== true && (
            <p className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-[0.72rem] leading-6 text-amber-800">
              ⚠️ هذا المحتوى توضيحي بانتظار تأكيد المشرف (لم تُراجع المواصفات والادعاءات بعد).
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-base font-extrabold text-ink-950">المواصفات</h2>
            {product.verifiedSpecs === true ? (
              <p className="mt-1 text-[0.72rem] font-bold text-emerald-700">✓ مواصفات مؤكدة من المشرف</p>
            ) : (
              <p className="mt-1 text-[0.72rem] text-amber-700">
                بيانات توضيحية غير مؤكدة — لا تُعتمد كمواصفات نهائية.
              </p>
            )}
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">مواصفات {product.name}</caption>
              <tbody className="divide-y divide-ink-100">
                {fullSpecs.map((spec) => (
                  <tr key={spec.label}>
                    <th scope="row" className="py-2.5 text-start font-bold text-ink-700">{spec.label}</th>
                    <td className="py-2.5 text-end text-ink-500">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {product.packageIncludes.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-extrabold text-ink-950">محتويات العبوة</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.packageIncludes.map((item) => (
                  <li key={item} className="rounded-lg bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-700">✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {product.compatibility.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-extrabold text-ink-950">التوافق</h2>
              <ul className="mt-3 space-y-2">
                {product.compatibility.map((c) => (
                  <li key={c} className="text-sm leading-7 text-ink-600">• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {product.warnings.length > 0 && (
            <div className="card border-amber-200 bg-amber-50/60 p-5">
              <h2 className="text-base font-extrabold text-amber-800">تحذيرات مهمة</h2>
              <ul className="mt-3 space-y-2">
                {product.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm leading-7 text-amber-800">
                    <span aria-hidden>⚠</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.warranty && (
            <div className="card p-5">
              <h2 className="text-base font-extrabold text-ink-950">الضمان</h2>
              <p className="mt-2 text-sm leading-7 text-ink-600">{product.warranty}</p>
            </div>
          )}

          {product.videoUrl && (
            <div className="card p-5">
              <h2 className="text-base font-extrabold text-ink-950">فيديو المنتج</h2>
              <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3">
                مشاهدة الفيديو
              </a>
            </div>
          )}
        </div>
      </section>

      {/* الأسئلة الشائعة للمنتج */}
      {product.faqs && product.faqs.length > 0 && (
        <section aria-labelledby="product-faq" className="mt-14">
          <h2 id="product-faq" className="h-section mb-5">أسئلة شائعة عن المنتج</h2>
          <div className="card divide-y divide-ink-100 overflow-hidden">
            {product.faqs.map((item) => (
              <details key={item.question} className="group px-4 py-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[0.9rem] font-bold text-ink-800">
                  {item.question}
                  <span className="text-ink-300 transition-transform group-open:rotate-180" aria-hidden>⌄</span>
                </summary>
                <p className="mt-2 text-[0.84rem] leading-7 text-ink-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 card p-4">
        <p className="text-[0.75rem] leading-6 text-ink-500">
          هل تحتاج مساعدة قبل الشراء؟{" "}
          <Link href="/contact" className="font-bold text-brand-600 underline">تواصل معنا</Link>{" "}
          أو راجع{" "}
          <Link href="/policies/returns" className="font-bold text-brand-600 underline">سياسة الاستبدال والاسترجاع</Link>.
        </p>
      </div>

      {/* منتجات ذات صلة */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-14">
          <h2 id="related-title" className="h-section mb-5">منتجات ذات صلة</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}><ProductCard product={p} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}