import type { Coupon } from "@/lib/types";

/**
 * قواعد التسعير — تُستخدم من الطرفين:
 * - العميل (سلة/إتمام الطلب) لعرض الإجماليات
 * - الخادم (إنشاء الطلب) للتحقق وحفظ لقطة السعر
 */

export const SHIPPING_BASE = 60;
export const FREE_SHIPPING_THRESHOLD = 1000;

/** كوبونات تجريبية — لا ترتبط بأي نظام دفع حقيقي */
export const coupons: Coupon[] = [
  {
    code: "AUTO10",
    type: "percent",
    value: 10,
    description: "خصم 10% على الإجمالي الفرعي (تجريبي)",
  },
  {
    code: "ROAD50",
    type: "fixed",
    value: 50,
    minSubtotal: 300,
    description: "خصم 50 ج.م للطلبات فوق 300 ج.م (تجريبي)",
  },
  {
    code: "FREESHIP",
    type: "shipping",
    value: 0,
    description: "شحن مجاني (تجريبي)",
  },
];

export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return coupons.find((c) => c.code === normalized);
}

export interface TotalsInput {
  subtotal: number;
  coupon?: Coupon | null;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
}

export function computeTotals({ subtotal, coupon }: TotalsInput): Totals {
  let discount = 0;
  let shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_BASE;

  if (subtotal <= 0) {
    shipping = 0;
  }

  if (coupon) {
    const meetsMinimum = !coupon.minSubtotal || subtotal >= coupon.minSubtotal;
    if (meetsMinimum) {
      if (coupon.type === "percent") {
        discount = Math.round((subtotal * coupon.value) / 100);
      } else if (coupon.type === "fixed") {
        discount = coupon.value;
      } else if (coupon.type === "shipping") {
        shipping = 0;
      }
    }
  }

  discount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - discount) + shipping;

  return {
    subtotal,
    discount,
    shipping,
    total,
    couponCode: coupon?.code ?? null,
  };
}
