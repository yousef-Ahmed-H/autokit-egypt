import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listBanners, saveBanners } from "@/lib/content/store";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { randomUUID } from "node:crypto";

export const metadata: Metadata = { title: "البنرات" };
export const dynamic = "force-dynamic";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function num(formData: FormData, key: string): number {
  const v = Number(str(formData, key));
  return Number.isFinite(v) ? v : 0;
}

export async function saveBannersAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("content.manage");
  const banners = (await listBanners()).map((b) => ({
    ...b,
    title: str(formData, `title_${b.id}`) || b.title,
    text: str(formData, `text_${b.id}`),
    href: str(formData, `href_${b.id}`),
    active: bool(formData, `active_${b.id}`),
    order: num(formData, `order_${b.id}`),
  }));
  await saveBanners(banners);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "banners", summary: "تحديث البنرات" },
  );
  revalidatePath("/admin/banners");
  redirect("/admin/banners?ok=" + encodeURIComponent("تم حفظ البنرات"));
}

export async function addBannerAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("content.manage");
  const banners = await listBanners();
  banners.push({
    id: randomUUID(),
    title: str(formData, "title") || "بنر جديد",
    text: str(formData, "text"),
    href: str(formData, "href"),
    active: true,
    order: banners.length + 1,
  });
  await saveBanners(banners);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "create", entity: "banners", summary: "إضافة بنر" },
  );
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}