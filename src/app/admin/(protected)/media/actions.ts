"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import {
  addVideo,
  deleteProductImage,
  deleteVideo,
  saveProductImage,
  updateImageMeta,
} from "@/lib/media/store";
import type { MediaImage } from "@/lib/media/types";
import { safeSlug } from "@/lib/media/validate";

const KINDS: MediaImage["kind"][] = ["main", "size", "usage", "gallery"];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function mediaHref(query = ""): string {
  return query ? `/admin/media?${query}` : "/admin/media";
}

function revalidateProduct(slug: string): void {
  revalidatePath("/admin/media");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath(`/products/${slug}`);
}

/** رفع صورة منتج: تحقق أمني + ضغط WebP + Thumbnail. */
export async function uploadImageAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("media.upload");

  const slug = safeSlug(str(formData, "productSlug"));
  const kindRaw = str(formData, "kind");
  const kind = (KINDS.includes(kindRaw as MediaImage["kind"]) ? kindRaw : "gallery") as MediaImage["kind"];
  const altAr = str(formData, "altAr");
  const source = str(formData, "source");
  const sourceType: MediaImage["sourceType"] = str(formData, "sourceType") === "real" ? "real" : "illustrative";
  const file = formData.get("file");

  if (!slug) redirect(mediaHref(`err=${encodeURIComponent("اختر منتجًا صحيحًا")}`));
  if (!(file instanceof File) || file.size === 0) {
    redirect(mediaHref(`err=${encodeURIComponent("اختر صورة من هاتفك")}`));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await saveProductImage({
    productSlug: slug,
    buffer,
    size: file.size,
    meta: { productSlug: slug, kind, altAr, source, sourceType, createdBy: admin.email },
  });

  if (!result.ok) {
    redirect(mediaHref(`err=${encodeURIComponent(result.error ?? "فشل رفع الصورة")}`));
  }

  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "create", entity: "media_image", entityId: slug, summary: `رفع صورة للمنتج ${slug}` },
  );
  revalidateProduct(slug);
  redirect(mediaHref(`ok=${encodeURIComponent("تم رفع الصورة وضغطها بنجاح")}`));
}

/** تعديل وصف الصورة (Alt / المصدر / النوع). */
export async function updateImageAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("media.upload");
  const id = str(formData, "id");
  const slug = safeSlug(str(formData, "productSlug"));
  const kindRaw = str(formData, "kind");
  const kind = (KINDS.includes(kindRaw as MediaImage["kind"]) ? kindRaw : "gallery") as MediaImage["kind"];
  const sourceType: MediaImage["sourceType"] = str(formData, "sourceType") === "real" ? "real" : "illustrative";
  const altAr = str(formData, "altAr");
  const source = str(formData, "source");

  if (altAr) {
    await updateImageMeta(id, { altAr, source, sourceType, kind });
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "update", entity: "media_image", entityId: id, summary: "تعديل وصف صورة" },
    );
  }
  revalidateProduct(slug);
  redirect(mediaHref("ok=" + encodeURIComponent("تم تحديث وصف الصورة")));
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("media.delete");
  const id = str(formData, "id");
  const slug = safeSlug(str(formData, "productSlug"));
  const removed = await deleteProductImage(id);
  if (removed) {
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "delete", entity: "media_image", entityId: id, summary: `حذف صورة من المنتج ${slug}` },
    );
  }
  revalidateProduct(slug);
  redirect(mediaHref("ok=" + encodeURIComponent("تم حذف الصورة")));
}

/** إضافة فيديو (رابط فقط — بلا رفع ملفات ثقيلة). */
export async function addVideoAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("media.upload");
  const slug = safeSlug(str(formData, "productSlug"));
  const url = str(formData, "url");
  const title = str(formData, "title");
  const source = str(formData, "source");
  const sourceType: MediaImage["sourceType"] = str(formData, "sourceType") === "real" ? "real" : "illustrative";

  if (!slug || !url || !source) {
    redirect(mediaHref(`err=${encodeURIComponent("رابط الفيديو والمصدر مطلوبان")}`));
  }

  await addVideo({ productSlug: slug, url, title, source, sourceType, createdBy: admin.email });
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "create", entity: "media_video", entityId: slug, summary: `إضافة فيديو للمنتج ${slug}` },
  );
  revalidateProduct(slug);
  redirect(mediaHref("ok=" + encodeURIComponent("تمت إضافة الفيديو")));
}

export async function deleteVideoAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("media.delete");
  const id = str(formData, "id");
  const slug = safeSlug(str(formData, "productSlug"));
  await deleteVideo(id);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "delete", entity: "media_video", entityId: id, summary: `حذف فيديو من المنتج ${slug}` },
  );
  revalidateProduct(slug);
  redirect(mediaHref("ok=" + encodeURIComponent("تم حذف الفيديو")));
}