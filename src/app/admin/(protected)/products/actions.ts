"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { saveProductOverride, clearProductOverride } from "@/lib/admin/product-overrides";
import type { CategorySlug, Product, ProductStatus } from "@/lib/types";
import { parseFaqs, parseLines, parseSpecs } from "@/app/admin/(protected)/products/format";

const CATEGORY_SLUGS: CategorySlug[] = ["mounts", "charging", "care", "travel"];
const STATUSES: ProductStatus[] = ["active", "draft", "archived"];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string): number | undefined {
  const raw = str(formData, key);
  if (raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/**
 * حفظ تعديلات منتج.
 * ⚠️ لا نخترع مواصفات: خانات «تأكيد المشرف» هي التي تسمح بعرض المواصفات/المحتوى كحقائق.
 */
export async function saveProductAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("products.write");

  const slug = str(formData, "slug");
  if (!slug) redirect("/admin/products");

  const category = str(formData, "category") as CategorySlug;
  const status = str(formData, "status") as ProductStatus;
  const patch: Partial<Product> = {
    name: str(formData, "name"),
    sku: str(formData, "sku"),
    category: CATEGORY_SLUGS.includes(category) ? category : "mounts",
    status: STATUSES.includes(status) ? status : "draft",
    shortDescription: str(formData, "shortDescription"),
    description: str(formData, "description"),
    price: num(formData, "price") ?? 0,
    stock: num(formData, "stock") ?? 0,
    minStock: num(formData, "minStock") ?? 0,
    weightKg: num(formData, "weightKg") ?? 0,
    dimensions: str(formData, "dimensions"),
    color: str(formData, "color"),
    material: str(formData, "material"),
    badge: str(formData, "badge") || undefined,
    warranty: str(formData, "warranty"),
    videoUrl: str(formData, "videoUrl") || undefined,
    features: parseLines(str(formData, "features")),
    usage: parseLines(str(formData, "usage")),
    specs: parseSpecs(str(formData, "specs")),
    packageIncludes: parseLines(str(formData, "packageIncludes")),
    compatibility: parseLines(str(formData, "compatibility")),
    warnings: parseLines(str(formData, "warnings")),
    faqs: parseFaqs(str(formData, "faqs")),
    verifiedSpecs: bool(formData, "verifiedSpecs"),
    verifiedContent: bool(formData, "verifiedContent"),
    verifiedStats: bool(formData, "verifiedStats"),
  };

  const oldPrice = num(formData, "oldPrice");
  if (oldPrice !== undefined) patch.oldPrice = oldPrice;
  const costPrice = num(formData, "costPrice");
  if (costPrice !== undefined) patch.costPrice = costPrice;

  await saveProductOverride(slug, patch);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "product", entityId: slug, summary: `تعديل المنتج: ${patch.name || slug}` },
  );

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");
  redirect(`/admin/products/${slug}?saved=1`);
}

/** إعادة المنتج إلى بياناته الأساسية (إزالة كل التعديلات) */
export async function resetProductAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("products.write");
  const slug = str(formData, "slug");
  if (slug) {
    await clearProductOverride(slug);
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "update", entity: "product", entityId: slug, summary: `إعادة تعيين المنتج: ${slug}` },
    );
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${slug}`);
    revalidatePath(`/products/${slug}`);
  }
  redirect(`/admin/products/${slug}`);
}