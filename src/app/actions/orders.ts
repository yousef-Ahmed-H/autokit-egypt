"use server";

import { redirect } from "next/navigation";
import { createOrderFromPayload, type ValidationIssue } from "@/lib/orders/service";
import type { CheckoutState } from "@/app/actions/orders-state";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** قراءة منتجات السلة من الحقل المخفي (JSON) */
function parseItems(raw: string): { slug: string; quantity: number }[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is { slug: string; quantity: number } =>
          typeof i === "object" &&
          i !== null &&
          typeof (i as { slug: unknown }).slug === "string" &&
          typeof (i as { quantity: unknown }).quantity === "number",
      )
      .map((i) => ({ slug: i.slug, quantity: i.quantity }));
  } catch {
    return [];
  }
}

const FIELDS = [
  "fullName",
  "phone",
  "phone2",
  "governorate",
  "city",
  "village",
  "street",
  "houseNo",
  "floor",
  "landmark",
  "notes",
  "couponCode",
] as const;

export async function submitOrderAction(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const values: Record<string, string> = {};
  for (const key of FIELDS) values[key] = field(formData, key);

  const result = await createOrderFromPayload({
    ...values,
    paymentMethod: "cod",
    agreement: formData.get("agreement") === "on" || field(formData, "agreement") === "true",
    couponCode: values.couponCode || null,
    items: parseItems(field(formData, "items")),
    idempotencyKey: field(formData, "idempotencyKey"),
  });

  if (!result.ok || !result.order) {
    return {
      status: "error",
      issues: result.issues,
      message: "لم يتم إنشاء الطلب — راجع البيانات المطلوبة أدناه.",
      values,
    };
  }

  // نجاح: الانتقال لصفحة نجاح الطلب (الطلب محفوظ بمفتاح تكرار يمنع الإنشاء المزدوج)
  redirect(`/order/success?no=${encodeURIComponent(result.order.orderNumber)}`);
}