"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import type { Coupon } from "@/lib/types";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

const KEY = "coupons";
const DATA_DIR = ".data";

async function readCoupons(): Promise<Coupon[]> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const file = path.join(process.cwd(), DATA_DIR, "coupons.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCoupons(list: Coupon[]): Promise<void> {
  const { promises: fs } = await import("node:fs");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), DATA_DIR);
  const file = path.join(dir, "coupons.json");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf8");
}

export async function createCouponAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("coupons.manage");
  const code = str(formData, "code").toUpperCase();
  const type = str(formData, "type") as Coupon["type"];
  const value = num(formData, "value");
  const minSubtotal = num(formData, "minSubtotal");
  const description = str(formData, "description");

  if (!code || !["percent", "fixed", "shipping"].includes(type) || value === null) {
    redirect("/admin/coupons?err=" + encodeURIComponent("بيانات الكوبون غير مكتملة"));
  }

  const list = await readCoupons();
  if (list.some((c) => c.code === code)) {
    redirect("/admin/coupons?err=" + encodeURIComponent("هذا الكود موجود بالفعل"));
  }

  const coupon: Coupon = {
    code,
    type,
    value,
    description: description || code,
    ...(minSubtotal !== null ? { minSubtotal } : {}),
  };
  await writeCoupons([coupon, ...list]);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "create", entity: "coupon", entityId: code, summary: `إنشاء كوبون ${code}` },
  );
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?ok=" + encodeURIComponent("تم إنشاء الكوبون"));
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("coupons.manage");
  const code = str(formData, "code").toUpperCase();
  const list = await readCoupons();
  await writeCoupons(list.filter((c) => c.code !== code));
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "delete", entity: "coupon", entityId: code, summary: `حذف كوبون ${code}` },
  );
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?ok=" + encodeURIComponent("تم حذف الكوبون"));
}