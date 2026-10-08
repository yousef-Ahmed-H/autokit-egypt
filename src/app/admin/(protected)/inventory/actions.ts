"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { saveProductOverride } from "@/lib/admin/product-overrides";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

/** تعديل المخزون والحد الأدنى لمنتج واحد. */
export async function updateStockAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("inventory.update");
  const slug = str(formData, "slug");
  const stock = num(formData, "stock");
  const minStock = num(formData, "minStock");

  if (slug && stock !== null && minStock !== null) {
    await saveProductOverride(slug, { stock, minStock });
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "update", entity: "inventory", entityId: slug, summary: `تحديث المخزون (${stock}) والحد الأدنى (${minStock})` },
    );
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  redirect("/admin/inventory?ok=" + encodeURIComponent("تم تحديث المخزون"));
}