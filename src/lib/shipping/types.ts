/**
 * نظام الشحن — الأنواع.
 *
 * ⚠️ في هذه المرحلة:
 * - لا يوجد اتصال بأي API حقيقي.
 * - إدخال الشحنة يتم يدويًا من لوحة التحكم.
 * - لا تُستخدم أي بيانات دخول وهمية.
 * - لا تُرسل أي شحنة فعلية دون موافقة المشرف.
 * - لا يُعرض التتبع كـ«مباشر» إلا بعد ربط API فعلي.
 */

export type ShippingAdapterId = "manual" | "bosta" | "mylerz" | "aramex";

export interface ShippingCompany {
  id: string;
  name: string;
  adapter: ShippingAdapterId;
  active: boolean;
  /** هل تم ضبط مفاتيح الاتصال في متغيرات البيئة؟ (لا نخزّن أسرارًا هنا) */
  credentialsConfigured: boolean;
  notes: string;
  createdAt: string;
  demo?: boolean;
}

export interface ShippingZone {
  id: string;
  governorate: string;
  /** المراكز/المدن داخل المحافظة */
  centers: string[];
  /** القرى لكل مركز */
  villages: Record<string, string[]>;
  /** مناطق بعيدة (سعر أعلى) */
  remoteAreas: string[];
  /** سعر الشحن (ج.م) */
  shippingFee: number;
  /** تكلفة المرتجع (ج.م) */
  returnFee: number;
  /** مدة التوصيل بالأيام */
  etaMinDays: number;
  etaMaxDays: number;
  /** الدفع عند الاستلام متاح؟ */
  codEnabled: boolean;
  active: boolean;
  demo?: boolean;
}

export type ShipmentStatus =
  | "draft" // مُسجّلة يدويًا
  | "created" // تم إنشاؤها لدى الشركة
  | "picked_up" // تم الاستلام
  | "in_transit" // في الطريق
  | "out_for_delivery" // خرج للتسليم
  | "delivered" // تم التسليم
  | "failed"
  | "returned";

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  draft: "مسجّلة يدويًا",
  created: "تم إنشاؤها",
  picked_up: "تم الاستلام",
  in_transit: "في الطريق",
  out_for_delivery: "خرج للتسليم",
  delivered: "تم التسليم",
  failed: "فشل التسليم",
  returned: "مرتجع",
};

export interface Shipment {
  id: string;
  orderNumber: string;
  companyId: string;
  adapter: ShippingAdapterId;
  status: ShipmentStatus;
  /** رقم الشحنة لدى شركة الشحن */
  trackingNumber: string;
  /** رابط التتبع (قد يكون يدويًا) */
  trackingUrl: string;
  /** مبلغ الدفع عند الاستلام (COD) */
  codAmount: number;
  /** هل تم تحصيل مبلغ الدفع عند الاستلام؟ */
  codCollected: boolean;
  /** تاريخ تحويل الأموال إلينا */
  transferDate?: string;
  /** مبلغ التحويل الفعلي المستلم */
  transferredAmount?: number;
  governorate: string;
  center: string;
  notes: string;
  /** إدخال يدوي (لا API) */
  manual: boolean;
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
}

/** مسودة شحنة تُرسل إلى الـ Adapter */
export interface ShipmentDraft {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  governorate: string;
  center: string;
  weightKg: number;
  codAmount: number;
  notes?: string;
}

export interface ShipmentResult {
  ok: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  error?: string;
  /** هل التتبع مباشر من الشركة أم يدوي؟ */
  live?: boolean;
}