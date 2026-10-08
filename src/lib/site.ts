import { IS_DEMO } from "@/lib/config";

/** إعدادات المتجر — قابلة للتعديل من متغيرات البيئة لاحقًا */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "AutoKit Egypt",
  nameAr: "أوتوكيت مصر",
  tagline: "إكسسوارات سيارات",
  description:
    "متجر إكسسوارات السيارات داخل مصر: حوامل موبايل، شواحن، كابلات، عناية وتنظيم — بيانات تجريبية.",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+20 100 000 0000",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "info@autokit-egypt.demo",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000",
  currency: "EGP",
  locale: "ar-EG",
  demo: IS_DEMO,
};

/** رابط واتساب مع رسالة جاهزة */
export function whatsappLink(message = "مرحبًا، أريد الاستفسار عن منتجات AutoKit Egypt."): string {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
