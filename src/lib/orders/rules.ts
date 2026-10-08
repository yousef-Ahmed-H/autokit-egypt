/**
 * قواعد الطلب المشتركة (آمنة للاستخدام في المتصفح والخادم).
 * لا تستورد أي شيء من `node:*` هنا.
 */

/** الحد الأقصى لكمية الصنف الواحد في الطلب */
export const MAX_QTY_PER_ITEM = 20;

/** نمط أرقام الموبايل المصرية: 010/011/012/015 + 8 أرقام */
export const PHONE_RE = /^01[0125]\d{8}$/;

export function isValidEgyptPhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim());
}

/** تنسيق رقم الهاتف للعرض */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}