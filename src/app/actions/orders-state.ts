/**
 * حالة نموذج إتمام الطلب — ملف آمن للعميل (بدون "use server").
 */
import type { ValidationIssue } from "@/lib/orders/service";

export interface CheckoutState {
  status: "idle" | "error";
  issues: ValidationIssue[];
  message?: string;
  /** البيانات المرسلة (لإعادة تعبئة النموذج عند الخطأ) */
  values?: Record<string, string>;
}

export const initialCheckoutState: CheckoutState = { status: "idle", issues: [] };