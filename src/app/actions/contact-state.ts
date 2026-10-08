/**
 * حالة نموذج التواصل — ملف آمن للعميل (بدون "use server").
 * لا يمكن تصدير قيم غير دالّية من ملفات "use server" إلى مكوّنات العميل،
 * لذلك نُبقي الحالة الابتدائية هنا.
 */
export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  issues: { field: string; message: string }[];
  values?: Record<string, string>;
}

export const initialContactState: ContactState = { status: "idle", issues: [] };