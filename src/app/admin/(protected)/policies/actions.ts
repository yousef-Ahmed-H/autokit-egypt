"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { savePolicy, type PolicySlug } from "@/lib/content/store";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const SLUGS: PolicySlug[] = ["shipping", "returns", "privacy", "terms"];

export async function savePolicyAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("content.manage");
  const slugRaw = str(formData, "slug");
  const slug = (SLUGS.includes(slugRaw as PolicySlug) ? slugRaw : "privacy") as PolicySlug;
  const title = str(formData, "title");
  const body = str(formData, "body");

  await savePolicy(slug, { title, body });
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "policy", entityId: slug, summary: `تحديث سياسة ${slug}` },
  );

  revalidatePath("/admin/policies");
  revalidatePath("/policies/shipping");
  revalidatePath("/policies/returns");
  revalidatePath("/policies/privacy");
  revalidatePath("/policies/terms");
  redirect("/admin/policies?ok=" + encodeURIComponent("تم حفظ السياسة"));
}