import Link from "next/link";
import type { Metadata } from "next";
import StatusTimeline from "@/components/orders/StatusTimeline";
import { trackOrder } from "@/lib/orders/service";
import { ORDER_STATUS_LABEL } from "@/lib/orders/types";
import { formatPrice } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "تتبع طلبك",
  description: "تابع حالة طلبك برقم الطلب ورقم الهاتف.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; phone?: string }>;
}) {
  const { no = "", phone = "" } = await searchParams;
  const attempted = Boolean(no && phone);
  const order = attempted ? await trackOrder(no, phone) : null;

  return (
    <div className="container-x section-y">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand-600">الرئيسية</Link></li>
          <li aria-hidden>←</li>
          <li className="font-bold text-ink-800">تتبع طلبك</li>
        </ol>
      </nav>

      <header className="mb-6">
        <p className="eyebrow mb-1.5">خدمة العملاء</p>
        <h1 className="h-section">تتبع طلبك</h1>
        <p className="mt-2 text-sm leading-7 text-ink-500">
          أدخل رقم الطلب (مثال: <span dir="ltr">AK-20260101-0001</span>) ورقم الموبايل المستخدم في الطلب.
        </p>
      </header>

      <form action="/track" method="get" className="card max-w-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="no" className="mb-1.5 block text-xs font-bold text-ink-700">
              رقم الطلب
            </label>
            <input
              id="no"
              name="no"
              dir="ltr"
              defaultValue={no}
              placeholder="AK-20260101-0001"
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-ink-700">
              رقم الموبايل
            </label>
            <input
              id="phone"
              name="phone"
              dir="ltr"
              inputMode="numeric"
              defaultValue={phone}
              placeholder="01xxxxxxxxx"
              className="field"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4 w-full sm:w-auto">
          تتبع الطلب
        </button>
      </form>

      {attempted && !order && (
        <div role="alert" className="mt-5 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-extrabold text-red-700">لم نجد طلبًا مطابقًا</p>
          <p className="mt-1 text-[0.82rem] text-red-600">
            تأكد من رقم الطلب ورقم الهاتف. إذا استمرت المشكلة تواصل معنا على واتساب.
          </p>
          <a
            href={whatsappLink(`مشكلة في تتبع الطلب رقم ${no}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-3 bg-[#25D366] text-white"
          >
            <WhatsAppIcon width={18} height={18} /> واتساب
          </a>
        </div>
      )}

      {order && (
        <section className="mt-6 space-y-6">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-400">رقم الطلب</p>
                <p className="text-lg font-extrabold text-ink-950" dir="ltr">{order.orderNumber}</p>
              </div>
              <span className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-extrabold text-brand-700">
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="mt-5">
              <StatusTimeline status={order.status} />
            </div>

            <dl className="mt-5 grid gap-3 border-t border-ink-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-400">تاريخ الطلب</dt>
                <dd className="font-bold text-ink-900">
                  {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">طريقة الدفع</dt>
                <dd className="font-bold text-ink-900">الدفع عند الاستلام</dd>
              </div>
              <div>
                <dt className="text-ink-400">الإجمالي النهائي</dt>
                <dd className="font-extrabold text-brand-600">{formatPrice(order.totals.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-950">منتجات الطلب</h2>
            <ul className="mt-3 divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt={item.name} className="h-12 w-16 rounded-md bg-ink-50 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink-900">{item.name}</p>
                    <p className="text-xs text-ink-400">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[0.72rem] text-ink-400">
            حالة الطلب تُحدَّث يدويًا من لوحة التحكم (تُنشأ في المرحلة التالية).
          </p>
        </section>
      )}
    </div>
  );
}