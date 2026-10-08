/**
 * التحقق من أمان ملفات الصور المرفوعة.
 * لا نعتمد على الاسم أو الامتداد أو `Content-Type` المُرسَل من المتصفح،
 * بل على البصمة الثنائية (magic bytes) الفعلية للملف.
 */

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 ميجابايت

export type AllowedMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

const ALLOWED: AllowedMime[] = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function startsWith(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false;
  return bytes.every((b, i) => buf[i] === b);
}

/** كشف نوع الصورة الحقيقي من البصمة الثنائية */
export function sniffImageMime(buf: Buffer): AllowedMime | null {
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  // AVIF: صندوق ftyp ثم العلامة avif/avis
  if (buf.length >= 16 && buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (buf.toString("ascii", 0, 32).includes("avif")) return "image/avif";
  }
  return null;
}

export interface FileCheckResult {
  ok: boolean;
  mime?: AllowedMime;
  reason?: string;
}

/** تحقق كامل: الحجم المسموح + النوع المسموح + رفض الملفات غير الآمنة */
export function validateImageFile(file: { size: number; buffer: Buffer }): FileCheckResult {
  if (file.size <= 0 || file.buffer.length === 0) {
    return { ok: false, reason: "الملف فارغ" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: `حجم الصورة يتجاوز الحد المسموح (${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} ميجابايت)` };
  }

  // رفض الملفات النصية/التنفيذية/المضغوطة التي قد تُخفى كصورة
  const head = file.buffer.toString("utf8", 0, Math.min(200, file.buffer.length)).toLowerCase();
  if (head.includes("<svg") || head.includes("<?xml") || head.startsWith("<!doctype html") || head.includes("<script")) {
    return { ok: false, reason: "صيغة الملف غير مسموحة (SVG/HTML/سكريبت)" };
  }

  const mime = sniffImageMime(file.buffer);
  if (!mime || !ALLOWED.includes(mime)) {
    return { ok: false, reason: "نوع الصورة غير مسموح (المسموح: JPG / PNG / WebP / AVIF)" };
  }

  return { ok: true, mime };
}

/** تنظيف الـ slug لاستخدامه في مسار الملفات (منع تجاوز المسار) */
export function safeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}