import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { createJsonStore } from "@/lib/admin/json-store";
import {
  MAX_IMAGES_PER_PRODUCT,
  type MediaImage,
  type MediaVideo,
} from "@/lib/media/types";
import { safeSlug, validateImageFile } from "@/lib/media/validate";

/**
 * مخزن وسائط المنتجات (تطوير فقط).
 * - يُحفظ الوصف في `.data/media.json`.
 * - تُحفظ الصور المعالجة في `public/uploads/products/<slug>/`.
 * - الضغط والتحويل إلى WebP عبر sharp + إنشاء صورة مصغّرة.
 *
 * عند ربط Supabase: انقل الملفات إلى Storage واستبدل هذا الملف باستعلامات الجداول.
 */

const store = createJsonStore<{ images: MediaImage[]; videos: MediaVideo[] }>("media.json", {
  images: [],
  videos: [],
});

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "products");

export interface SaveImageInput {
  productSlug: string;
  kind: MediaImage["kind"];
  altAr: string;
  source: string;
  sourceType: MediaImage["sourceType"];
  createdBy: string;
}

export interface SaveImageResult {
  ok: boolean;
  image?: MediaImage;
  error?: string;
}

async function assertCapacity(productSlug: string): Promise<string | null> {
  const { images } = await store.read();
  const count = images.filter((i) => i.productSlug === productSlug).length;
  if (count >= MAX_IMAGES_PER_PRODUCT) {
    return `الحد الأقصى ${MAX_IMAGES_PER_PRODUCT} صور لكل منتج`;
  }
  return null;
}

/**
 * معالجة صورة ورفعها:
 * 1) التحقق من النوع والحجم (رفض الملفات غير الآمنة).
 * 2) تدوير تلقائي + تصغير + تحويل WebP عالي الضغط.
 * 3) إنشاء صورة مصغّرة (Thumbnail).
 */
export async function saveProductImage(file: {
  productSlug: string;
  buffer: Buffer;
  size: number;
  meta: SaveImageInput;
}): Promise<SaveImageResult> {
  const slug = safeSlug(file.productSlug);
  if (!slug) return { ok: false, error: "معرّف المنتج غير صالح" };
  if (!file.meta.altAr.trim()) return { ok: false, error: "نص الصورة البديل (Alt) بالعربية مطلوب" };
  if (!file.meta.source.trim()) return { ok: false, error: "مصدر الصورة مطلوب" };

  const capacityError = await assertCapacity(slug);
  if (capacityError) return { ok: false, error: capacityError };

  const check = validateImageFile({ size: file.size, buffer: file.buffer });
  if (!check.ok) return { ok: false, error: check.reason };

  try {
    const id = randomUUID();
    const dir = path.join(UPLOAD_ROOT, slug);
    await fs.mkdir(dir, { recursive: true });

    const meta = await sharp(file.buffer).rotate().metadata();

    const full = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const thumb = await sharp(file.buffer)
      .rotate()
      .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    const fullName = `${id}.webp`;
    const thumbName = `${id}-thumb.webp`;
    await fs.writeFile(path.join(dir, fullName), full);
    await fs.writeFile(path.join(dir, thumbName), thumb);

    const image: MediaImage = {
      id,
      productSlug: slug,
      kind: file.meta.kind,
      altAr: file.meta.altAr.trim(),
      source: file.meta.source.trim(),
      sourceType: file.meta.sourceType,
      mime: "image/webp",
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      bytes: full.length,
      url: `/uploads/products/${slug}/${fullName}`,
      thumbUrl: `/uploads/products/${slug}/${thumbName}`,
      createdAt: new Date().toISOString(),
      createdBy: file.meta.createdBy,
      demo: true,
    };

    await store.update((current) => ({ ...current, images: [...current.images, image] }));
    return { ok: true, image };
  } catch (error) {
    return { ok: false, error: `تعذّرت معالجة الصورة: ${(error as Error).message}` };
  }
}

export async function listProductImages(productSlug: string): Promise<MediaImage[]> {
  const { images } = await store.read();
  return images.filter((i) => i.productSlug === safeSlug(productSlug));
}

export async function listAllImages(): Promise<MediaImage[]> {
  const { images } = await store.read();
  return images;
}

export async function listProductVideos(productSlug: string): Promise<MediaVideo[]> {
  const { videos } = await store.read();
  return videos.filter((v) => v.productSlug === safeSlug(productSlug));
}

export async function listVideos(): Promise<MediaVideo[]> {
  const { videos } = await store.read();
  return videos;
}

/** حذف صورة (وصف + ملفات) */
export async function deleteProductImage(id: string): Promise<boolean> {
  let removed: MediaImage | undefined;
  await store.update((current) => {
    removed = current.images.find((i) => i.id === id);
    return { ...current, images: current.images.filter((i) => i.id !== id) };
  });
  if (!removed) return false;
  await removeFiles(removed);
  return true;
}

async function removeFiles(image: MediaImage): Promise<void> {
  const dir = path.join(UPLOAD_ROOT, safeSlug(image.productSlug));
  for (const name of [path.basename(image.url), path.basename(image.thumbUrl)]) {
    try {
      await fs.unlink(path.join(dir, name));
    } catch {
      /* تجاهل: الملف قد يكون محذوفًا */
    }
  }
}

/** تعديل حقول الوصف (Alt / المصدر / النوع / النوع المنطقي) */
export async function updateImageMeta(
  id: string,
  patch: Partial<Pick<MediaImage, "altAr" | "source" | "sourceType" | "kind">>,
): Promise<MediaImage | null> {
  let updated: MediaImage | null = null;
  await store.update((current) => ({
    ...current,
    images: current.images.map((i) => {
      if (i.id !== id) return i;
      const next: MediaImage = { ...i };
      if (patch.altAr !== undefined) next.altAr = patch.altAr;
      if (patch.source !== undefined) next.source = patch.source;
      if (patch.sourceType !== undefined) next.sourceType = patch.sourceType;
      if (patch.kind !== undefined) next.kind = patch.kind;
      updated = next;
      return next;
    }),
  }));
  return updated;
}

export async function addVideo(input: {
  productSlug: string;
  url: string;
  title: string;
  source: string;
  sourceType: MediaImage["sourceType"];
  createdBy: string;
}): Promise<MediaVideo> {
  const video: MediaVideo = {
    id: randomUUID(),
    productSlug: safeSlug(input.productSlug),
    url: input.url.trim(),
    title: input.title.trim(),
    source: input.source.trim(),
    sourceType: input.sourceType,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    demo: true,
  };
  await store.update((current) => ({ ...current, videos: [...current.videos, video] }));
  return video;
}

export async function deleteVideo(id: string): Promise<void> {
  await store.update((current) => ({ ...current, videos: current.videos.filter((v) => v.id !== id) }));
}

/** كل صور منتج مرتّبة (رئيسية ثم الحجم ثم الاستخدام ثم الإضافية) */
export async function orderedProductImages(productSlug: string): Promise<MediaImage[]> {
  const order: MediaImage["kind"][] = ["main", "size", "usage", "gallery"];
  const images = await listProductImages(productSlug);
  return [...images].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}