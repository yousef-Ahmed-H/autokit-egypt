/**
 * نظام الصور والمحتوى — الأنواع.
 *
 * المبادئ:
 * - لا تُستخدم صور عشوائية من الإنترنت ولا صور عليها حقوق غير معروفة.
 * - كل صورة تحمل: نص بديل عربي، مصدرًا، ونوعًا (حقيقية / توضيحية).
 * - الصورة التوضيحية (مولّدة بالذكاء الاصطناعي أو رسم توضيحي) ليست دليلًا
 *   على المنتج الحقيقي، ويجب وسمها بوضوح في الواجهة.
 */

export type MediaKind =
  | "main" // الصورة الرئيسية
  | "size" // صورة توضّح الحجم/الأبعاد
  | "usage" // صورة توضّح طريقة الاستخدام
  | "gallery"; // صور إضافية

export type MediaSourceType =
  | "real" // صورة حقيقية للمنتج
  | "illustrative"; // صورة توضيحية / مولّدة — ليست دليلًا على المنتج الحقيقي

export const MEDIA_KIND_LABEL: Record<MediaKind, string> = {
  main: "رئيسية",
  size: "الحجم",
  usage: "طريقة الاستخدام",
  gallery: "إضافية",
};

export const MEDIA_SOURCE_LABEL: Record<MediaSourceType, string> = {
  real: "حقيقية",
  illustrative: "توضيحية (ليست دليلًا على المنتج)",
};

export interface MediaImage {
  id: string;
  productSlug: string;
  kind: MediaKind;
  /** نص بديل عربي — إجباري لملء الصورة (alt) */
  altAr: string;
  /** مصدر الصورة (من أنشأها/من أين) */
  source: string;
  sourceType: MediaSourceType;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  /** مسار الصورة المُحسّنة (WebP) */
  url: string;
  /** صورة مصغّرة (Thumbnail) */
  thumbUrl: string;
  createdAt: string;
  createdBy: string;
  demo?: boolean;
}

export interface MediaVideo {
  id: string;
  productSlug: string;
  /** رابط الفيديو القصير (اختياري) */
  url: string;
  title: string;
  source: string;
  sourceType: MediaSourceType;
  createdAt: string;
  createdBy: string;
  demo?: boolean;
}

export interface MediaLibrary {
  images: MediaImage[];
  videos: MediaVideo[];
}

export const MAX_IMAGES_PER_PRODUCT = 6;
export const MIN_IMAGES_PER_PRODUCT = 3;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 ميجابايت
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;