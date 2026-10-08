import Link from "next/link";
import type { Metadata } from "next";
import StatusTimeline from "@/components/orders/StatusTimeline";
import { ClearCartOnSuccess, CopyOrderNumber } from "@/components/checkout/OrderSuccessBits";
import { WhatsAppIcon } from "@/components/ui/icons";
import { findOrderDirect } from "@/lib/orders/store";
import { ORDER_STATUS_LABEL } from "@/lib/orders/types";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "تم استلام طلبك",
  robots: { index: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;
  const order = no ? await findOrderDirect(no) : null;

  if (!order) {
    return (
      <div className="container-x section-y">
        <div className="card mx-auto max-w-xl p-10 text-center">
          <h1 className="text-lg font-extrabold text-ink-950">لم نجد هذا الطلب</h1>
          <p className="mt-2 text-sm text-ink-500">
            تأكد من رقم الطلب، أو تابع طلبك من صفحة التتبع.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/track" className="btn btn-primary">تتبع طلبك</Link>
            <Link href="/products" className="btn btn-outline">تصفّح المنتجات</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x section-y">
      <ClearCartOnSuccess />

      <div className="card mx-auto max-w-3xl overflow-hidden">
        <div className="bg-ink-950 p-6 text-center text-white">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-2xl" aria-hidden>
            ✓
          </span>
          <h1 className="mt-3 text-xl font-extrabold">تم استلام طلبك بنجاح</h1>
          <p className="mt-1 text-sm text-ink-300">
            سنتواصل معك لتأكيد الطلب. الدفع عند الاستلام.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-lg bg-white/10 px-3 py-2 text-sm font-extrabold" dir="ltr">
              {order.orderNumber}
            </span>
            <CopyOrderNumber orderNumber={order.orderNumber} />
          </div>

          <p className="mt-3 text-xs text-ink-400">
            حالة الطلب: <span className="font-bold text-brand-400">{ORDER_STATUS_LABEL[order.status]}</span>
          </p>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-extrabold text-ink-950">حالة الطلب</h2>
          <div className="mt-3">
            <StatusTimeline status={order.status} />
          </div>

          <h2 className="mt-6 text-sm font-extrabold text-ink-950">منتجات الطلب</h2>
          <ul className="mt-3 divide-y divide-ink-100">
            {order.items.map((item) => (
              <li key={item.slug} className="flex items-center gap-3 py-3">
                <img src={item.image} alt={item.name} className="h-12 w-16 rounded-md bg-ink-50 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-400">
                    {item.sku} — {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-ink-950">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-500">الإجمالي الفرعي</dt><dd>{formatPrice(order.totals.subtotal)}</dd></div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between"><dt className="text-ink-500">الخصم {order.totals.couponCode ? `(${order.totals.couponCode})` : ""}</dt><dd>-{formatPrice(order.totals.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-ink-500">الشحن</dt><dd>{formatPrice(order.totals.shipping)}</dd></div>
            <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-extrabold"><dt>الإجمالي</dt><dd>{formatPrice(order.totals.total)}</dd></div>
          </dl>

          <h2 className="mt-6 text-sm font-extrabold text-ink-950">عنوان التوصيل</h2>
          <address className="mt-2 text-sm not-italic leading-7 text-ink-600">
            {order.address.fullName} — <span dir="ltr">{order.address.phone}</span>
            {order.address.phone2 ? <> / <span dir="ltr">{order.address.phone2}</span></> : null}
            <br />
            {order.address.governorate} — {order.address.city}
            {order.address.village ? <> — {order.address.village}</> : null}
            <br />
            {order.address.street}
            {order.address.houseNo ? <> — رقم {order.address.houseNo}</> : null}
            {order.address.floor ? <> — {order.address.floor}</> : null}
            {order.address.landmark ? <> — علامة: {order.address.landmark}</> : null}
            {order.address.notes ? (
              <>
                <br />
                ملاحظات: {order.address.notes}
              </>
            ) : null}
          </address>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={whatsappLink(`مرحبًا، بخصوص طلبي رقم ${order.orderNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#25D366] text-white hover:brightness-95"
            >
              <WhatsAppIcon width={18} height={18} /> تواصل على واتساب
            </a>
            <Link href={`/track?no=${encodeURIComponent(order.orderNumber)}`} className="btn btn-outline">
              تتبع الطلب
            </Link>
            <Link href="/products" className="btn btn-dark">متابعة التسوّق</Link>
          </div>

          <p className="mt-5 text-[0.72rem] leading-6 text-ink-400">
            ⚠️ هذا طلب تجريبي (Demo) لأغراض العرض فقط — لا يوجد دفع إلكتروني ولا شحن حقيقي،
            والبيانات محفوظة مؤقتًا داخل المشروع في انتظار ربط قاعدة البيانات.
          </p>
        </div>
      </div>
    </div>
  );
}