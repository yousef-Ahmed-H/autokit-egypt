/** نظام المرتجعات — الأنواع */

export type ReturnStatus =
  | "requested" // تم الطلب
  | "approved" // موافق عليه
  | "rejected" // مرفوض
  | "received" // تم استلام المنتج
  | "refunded" // تم رد المبلغ
  | "closed"; // مغلق

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  requested: "طلب جديد",
  approved: "مقبول",
  rejected: "مرفوض",
  received: "تم الاستلام",
  refunded: "تم رد المبلغ",
  closed: "مغلق",
};

export const RETURN_REASONS = [
  "المنتج مختلف عن الوصف",
  "المنتج تالف أو به عيب",
  "وصل متأخرًا",
  "طلبته بالخطأ",
  "لم يعد بحاجة إليه",
  "سبب آخر",
] as const;

export interface ReturnHistoryEntry {
  at: string;
  by: string;
  action: string;
  /** ملاحظة اختيارية على الحدث */
  note?: string;
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  reasonCategory: string;
  reasonText: string;
  /** صور المشكلة (روابط داخلية) */
  images: string[];
  status: ReturnStatus;
  adminNotes: string;
  /** تكلفة شحن المرتجع */
  shippingCost: number;
  /** المبلغ المسترد */
  refundAmount: number;
  /** سجل كامل للعملية */
  history: ReturnHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
}