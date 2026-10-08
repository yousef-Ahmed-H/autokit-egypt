/**
 * نظام الطلبات — الأنواع وحالات الطلب.
 * المرحلة القادمة: استبدال المخزن المحلي بجداول Supabase (supabase/schema.sql)
 * مع الحفاظ على نفس التواقيع.
 */

export type OrderStatus =
  | "pending" // في انتظار التأكيد
  | "confirmed" // مؤكد
  | "preparing" // قيد التجهيز
  | "handover" // تم تسليمه للشحن
  | "on_the_way" // في الطريق
  | "out_for_delivery" // خرج للتسليم
  | "delivered" // تم التسليم
  | "cancelled" // ملغى
  | "returned"; // مرتجع

export const ORDER_STATUSES: { key: OrderStatus; label: string; step: number }[] = [
  { key: "pending", label: "في انتظار التأكيد", step: 1 },
  { key: "confirmed", label: "مؤكد", step: 2 },
  { key: "preparing", label: "قيد التجهيز", step: 3 },
  { key: "handover", label: "تم تسليمه للشحن", step: 4 },
  { key: "on_the_way", label: "في الطريق", step: 5 },
  { key: "out_for_delivery", label: "خرج للتسليم", step: 6 },
  { key: "delivered", label: "تم التسليم", step: 7 },
  { key: "cancelled", label: "ملغى", step: 0 },
  { key: "returned", label: "مرتجع", step: 0 },
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = ORDER_STATUSES.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.label }),
  {} as Record<OrderStatus, string>,
);

export interface OrderAddress {
  fullName: string;
  phone: string;
  phone2?: string;
  governorate: string;
  city: string;
  village?: string;
  street: string;
  houseNo?: string;
  floor?: string;
  landmark?: string;
  notes?: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "cod";
  items: OrderItem[];
  totals: OrderTotals;
  /** لقطة العنوان وقت إنشاء الطلب */
  address: OrderAddress;
  /** مفتاح يمنع إنشاء الطلب مرتين (ضغط سريع / إعادة إرسال) */
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  /** ملاحظات داخلية للفريق (لا تظهر للعميل) */
  adminNotes?: string;
  /** ربط اختياري بالشحنة */
  shipmentId?: string;
  /** طلب ديمو؟ (false في الإنتاج) */
  demo: boolean;
}

/** المحافظات المصرية */
export const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
] as const;
