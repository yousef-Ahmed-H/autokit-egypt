"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import {
  findShipment,
  updateCompany,
  updateZone,
  saveShipment,
} from "@/lib/shipping/store";
import type { ShipmentStatus, ShippingZone } from "@/lib/shipping/types";

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "draft",
  "created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string, fallback = 0): number {
  const value = Number(str(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function lines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** قرى: كل سطر بصيغة «المركز | قرية1, قرية2» */
function parseVillages(raw: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const line of lines(raw)) {
    const [center, ...rest] = line.split("|");
    const name = (center ?? "").trim();
    if (!name) continue;
    result[name] = rest
      .join("|")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return result;
}

function shippingHref(query = ""): string {
  return query ? `/admin/shipping?${query}` : "/admin/shipping";
}

export async function updateCompanyAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("shipping.manage");
  const id = str(formData, "id");
  await updateCompany(id, {
    name: str(formData, "name"),
    active: bool(formData, "active"),
    notes: str(formData, "notes"),
  });
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "shipping_company", entityId: id, summary: "تعديل شركة شحن" },
  );
  revalidatePath("/admin/shipping");
  redirect(shippingHref("ok=" + encodeURIComponent("تم تحديث شركة الشحن")));
}

export async function updateZoneAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("shipping.manage");
  const id = str(formData, "id");
  const patch: Partial<ShippingZone> = {
    shippingFee: num(formData, "shippingFee"),
    returnFee: num(formData, "returnFee"),
    etaMinDays: num(formData, "etaMinDays", 1),
    etaMaxDays: num(formData, "etaMaxDays", 3),
    codEnabled: bool(formData, "codEnabled"),
    active: bool(formData, "active"),
    centers: lines(str(formData, "centers")),
    remoteAreas: lines(str(formData, "remoteAreas")),
    villages: parseVillages(str(formData, "villages")),
  };
  await updateZone(id, patch);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "shipping_zone", entityId: id, summary: "تعديل منطقة شحن" },
  );
  revalidatePath("/admin/shipping");
  redirect(shippingHref("ok=" + encodeURIComponent("تم تحديث منطقة الشحن")));
}

/** تحديث شحنة (رقم تتبّع / رابط / حالة) — إدخال يدوي، لا إرسال فعلي. */
export async function updateShipmentAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("shipping.manage");
  const id = str(formData, "id");
  const shipment = await findShipment(id);
  if (!shipment) redirect(shippingHref("err=" + encodeURIComponent("الشحنة غير موجودة")));

  const statusRaw = str(formData, "status");
  const status = (SHIPMENT_STATUSES.includes(statusRaw as ShipmentStatus) ? statusRaw : shipment.status) as ShipmentStatus;
  const next = {
    ...shipment,
    status,
    trackingNumber: str(formData, "trackingNumber"),
    trackingUrl: str(formData, "trackingUrl"),
    updatedAt: new Date().toISOString(),
  };
  await saveShipment(next);
  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "shipment", entityId: id, summary: `تحديث شحنة الطلب ${shipment.orderNumber}` },
  );
  revalidatePath("/admin/shipping");
  revalidatePath(`/admin/orders/${shipment.orderNumber}`);
  redirect(shippingHref("ok=" + encodeURIComponent("تم تحديث الشحنة")));
}