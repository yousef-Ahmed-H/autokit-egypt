"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { initialCheckoutState } from "@/app/actions/orders-state";
import { submitOrderAction } from "@/app/actions/orders";
import { useCart } from "@/components/cart/cart-context";
import { GOVERNORATES } from "@/lib/orders/types";
import { formatPrice } from "@/lib/format";

const ORDER_KEY_STORAGE = "autokit-order-key";

/** مفتاح يمنع إنشاء الطلب مرتين عند الضغط السريع أو إعادة الإرسال */
function useIdempotencyKey() {
  const [key, setKey] = useState("");

  useEffect(() => {
    try {
      const existing = window.sessionStorage.getItem(ORDER_KEY_STORAGE);
      if (existing) {
        setKey(existing);
        return;
      }
      const created = `ak-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(ORDER_KEY_STORAGE, created);
      setKey(created);
    } catch {
      setKey(`ak-${Date.now()}`);
    }
  }, []);

  return key;
}

function issueFor(issues: { field: string; message: string }[], field: string) {
  return issues.find((i) => i.field === field)?.message;
}

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(submitOrderAction, initialCheckoutState);
  const { resolvedLines, totals, hydrated, count } = useCart();
  const idempotencyKey = useIdempotencyKey();

  const itemsJson = useMemo(
    () => JSON.stringify(resolvedLines.map((l) => ({ slug: l.slug, quantity: l.quantity }))),
    [resolvedLines],
  );

  const values = state.values ?? {};
  const issues = state.issues ?? [];

  if (hydrated && count === 0) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-lg font-extrabold text-ink-950">لا يمكن إتمام الطلب</h2>
        <p className="mt-2 text-sm text-ink-500">سلتك فارغة — أضف منتجات أولًا ثم أكمل الطلب.</p>
        <Link href="/products" className="btn btn-primary mt-5">
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_340px]" noValidate>
      {/* الحقول المخفية: محتوى السلة + مفتاح منع التكرار */}
      <input type="hidden" name="items" value={itemsJson} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="paymentMethod" value="cod" />

      <div className="space-y-6">
        {state.status === "error" && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-extrabold text-red-700">{state.message}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[0.8rem] text-red-600">
              {issues.map((issue, index) => (
                <li key={`${issue.field}-${index}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* بيانات المستلم */}
        <section className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">بيانات المستلم</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-bold text-ink-700">
                الاسم بالكامل *
              </label>
              <input
                id="fullName"
                name="fullName"
                defaultValue={values.fullName ?? ""}
                required
                autoComplete="name"
                className="field"
                aria-invalid={Boolean(issueFor(issues, "fullName"))}
                aria-describedby="err-fullName"
              />
              <ErrorText id="err-fullName" message={issueFor(issues, "fullName")} />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-ink-700">
                رقم الهاتف *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                placeholder="01xxxxxxxxx"
                defaultValue={values.phone ?? ""}
                required
                autoComplete="tel"
                className="field"
                aria-invalid={Boolean(issueFor(issues, "phone"))}
                aria-describedby="err-phone"
              />
              <ErrorText id="err-phone" message={issueFor(issues, "phone")} />
            </div>

            <div>
              <label htmlFor="phone2" className="mb-1.5 block text-xs font-bold text-ink-700">
                رقم إضافي (اختياري)
              </label>
              <input
                id="phone2"
                name="phone2"
                defaultValue={values.phone2 ?? ""}
                autoComplete="tel-national"
                className="field"
                aria-invalid={Boolean(issueFor(issues, "phone2"))}
              />
              <ErrorText id="err-phone2" message={issueFor(issues, "phone2")} />
            </div>
          </div>
        </section>

        {/* العنوان */}
        <section className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">عنوان التوصيل</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="governorate" className="mb-1.5 block text-xs font-bold text-ink-700">
                المحافظة *
              </label>
              <select
                id="governorate"
                name="governorate"
                defaultValue={values.governorate ?? ""}
                required
                className="field"
                aria-invalid={Boolean(issueFor(issues, "governorate"))}
              >
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
              <ErrorText id="err-governorate" message={issueFor(issues, "governorate")} />
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-xs font-bold text-ink-700">
                المركز / المدينة *
              </label>
              <input
                id="city"
                name="city"
                defaultValue={values.city ?? ""}
                required
                className="field"
                aria-invalid={Boolean(issueFor(issues, "city"))}
              />
              <ErrorText id="err-city" message={issueFor(issues, "city")} />
            </div>

            <div>
              <label htmlFor="village" className="mb-1.5 block text-xs font-bold text-ink-700">
                القرية / الحي
              </label>
              <input id="village" name="village" defaultValue={values.village ?? ""} className="field" />
            </div>

            <div>
              <label htmlFor="street" className="mb-1.5 block text-xs font-bold text-ink-700">
                الشارع *
              </label>
              <input
                id="street"
                name="street"
                defaultValue={values.street ?? ""}
                required
                className="field"
                aria-invalid={Boolean(issueFor(issues, "street"))}
              />
              <ErrorText id="err-street" message={issueFor(issues, "street")} />
            </div>

            <div>
              <label htmlFor="houseNo" className="mb-1.5 block text-xs font-bold text-ink-700">
                رقم المنزل
              </label>
              <input id="houseNo" name="houseNo" defaultValue={values.houseNo ?? ""} className="field" />
            </div>

            <div>
              <label htmlFor="floor" className="mb-1.5 block text-xs font-bold text-ink-700">
                الدور والشقة
              </label>
              <input id="floor" name="floor" defaultValue={values.floor ?? ""} className="field" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="landmark" className="mb-1.5 block text-xs font-bold text-ink-700">
                علامة مميزة
              </label>
              <input
                id="landmark"
                name="landmark"
                defaultValue={values.landmark ?? ""}
                placeholder="مثال: بجوار مسجد النور"
                className="field"
              />
            </div>
          </div>
        </section>

        {/* الدفع والملاحظات */}
        <section className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">الدفع والملاحظات</h2>

          <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-4">
            <label className="flex items-center gap-3 text-sm font-bold text-ink-800">
              <input type="radio" name="payment" value="cod" defaultChecked disabled className="h-4 w-4" />
              الدفع عند الاستلام (الطريقة الوحيدة المتاحة)
            </label>
            <p className="mt-2 text-[0.75rem] leading-6 text-ink-500">
              لا يوجد دفع إلكتروني في هذه النسخة التجريبية، ولا يتم إرسال الطلب لأي شركة شحن حقيقية.
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="mb-1.5 block text-xs font-bold text-ink-700">
              ملاحظات الطلب
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={values.notes ?? ""}
              placeholder="أي تفاصيل تود إضافتها (مثال: التوصيل بعد الساعة 6 مساءً)"
              className="field"
            />
          </div>

          </section>
      </div>

      {/* ملخص الطلب */}
      <aside aria-label="ملخص الطلب" className="lg:sticky lg:top-32 lg:h-fit">
        <div className="card p-5">
          <h2 className="text-base font-extrabold text-ink-950">ملخص الطلب</h2>

          <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto pe-1">
            {resolvedLines.map((line) =>
              line.product ? (
                <li key={line.slug} className="flex items-start justify-between gap-3 text-[0.82rem]">
                  <span className="min-w-0">
                    <span className="block font-bold text-ink-800">{line.product.name}</span>
                    <span className="text-ink-400">
                      {latinNumber(line.quantity)} × {formatPrice(line.product.price)}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-ink-900">{formatPrice(line.lineTotal)}</span>
                </li>
              ) : null,
            )}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">الإجمالي الفرعي</dt>
              <dd className="font-bold">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">الخصم {totals.couponCode ? `(${totals.couponCode})` : ""}</dt>
              <dd className="font-bold text-emerald-700">− {formatPrice(totals.discount)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">تكلفة الشحن</dt>
              <dd className="font-bold">{totals.shipping === 0 ? "مجاني" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <dt className="font-extrabold text-ink-950">الإجمالي النهائي</dt>
              <dd className="text-lg font-extrabold text-brand-600">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <label className="mt-4 flex items-start gap-2 text-[0.75rem] font-semibold text-ink-600">
            <input
              type="checkbox"
              name="agreement"
              value="on"
              required
              className="mt-0.5 h-4 w-4"
              aria-describedby="err-agreement"
            />
            أوافق على سياسة الشحن والاسترجاع (تجريبية) *
          </label>
          <ErrorText id="err-agreement" message={issueFor(issues, "agreement")} />

          <button type="submit" className="btn btn-primary mt-4 w-full" disabled={isPending}>
            {isPending ? "جارٍ إنشاء الطلب…" : "تأكيد الطلب (الدفع عند الاستلام)"}
          </button>

          <p className="mt-3 text-[0.7rem] leading-6 text-ink-400">
            بالضغط على «تأكيد الطلب» يتم إنشاء طلب تجريبي فقط. يُمنع تكرار الطلب تلقائيًا عند الضغط
            السريع أو إعادة الإرسال.
          </p>

          <Link href="/cart" className="mt-3 block text-center text-xs font-bold text-ink-500 hover:text-brand-600">
            ← الرجوع للسلة
          </Link>
        </div>
      </aside>
    </form>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.72rem] font-bold text-red-600">
      {message}
    </p>
  );
}

function latinNumber(value: number) {
  return value.toLocaleString("en-US");
}