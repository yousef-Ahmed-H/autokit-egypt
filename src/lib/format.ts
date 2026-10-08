/** تنسيق العملة: الجنيه المصري (EGP) بأرقام لاتينية للوضوح */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("en-US")} ج.م`;
}

/** تنسيق الأرقام فقط */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/** حساب نسبة التخفيض */
export function discountPercent(price: number, oldPrice: number): number {
  if (oldPrice <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** رقم الطلب التجريبي: AK-YYYYMMDD-XXXX */
export function generateDemoOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AK-${y}${m}${day}-${rand}`;
}
