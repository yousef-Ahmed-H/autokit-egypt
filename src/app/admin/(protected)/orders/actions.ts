"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";
import { findOrderByNumber, patchOrder, updateOrderStatus } from "@/lib/orders/store";
import { createShipmentForOrder } from "@/lib/shipping/service";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function orderHref(orderNumber: string, query = ""): string {
  const base = `/admin/orders/${encodeURIComponent(orderNumber)}`;
  return query ? `${base}?${query}` : base;
}

/** تغيير حالة الطلب */
export async function changeStatusAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("orders.update_status");
  const orderNumber = str(formData, "orderNumber");
  const status = str(formData, "status") as OrderStatus;

  if (!orderNumber || !ORDER_STATUSES.some((s) => s.key === status)) {
    redirect(orderHref(orderNumber, "err=" + encodeURIComponent("حالة غير صحيحة")));
  }

  const updated = await updateOrderStatus(orderNumber, status);
  if (!updated) redirect("/admin/orders");

  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    {
      action: "status_change",
      entity: "order",
      entityId: orderNumber,
      summary: `تغيير حالة الطلب ${orderNumber} إلى «${ORDER_STATUSES.find((s) => s.key === status)?.label}»`,
    },
  );

  revalidatePath("/admin/orders");
  revalidatePath(orderHref(orderNumber));
  redirect(orderHref(orderNumber, "ok=status"));
}

/** حفظ الملاحظات الداخلية */
export async function saveOrderNotesAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("orders.update_status");
  const orderNumber = str(formData, "orderNumber");
  const adminNotes = str(formData, "adminNotes");

  const updated = await patchOrder(orderNumber, { adminNotes });
  if (!updated) redirect("/admin/orders");

  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "order", entityId: orderNumber, summary: `تحديث ملاحظات الطلب ${orderNumber}` },
  );

  revalidatePath(orderHref(orderNumber));
  redirect(orderHref(orderNumber, "ok=notes"));
}

/**
 * إنشاء شحنة يدوية للطلب.
 * ⚠️ لا يُرسل أي شيء لشركة شحن — الإدخال يدوي فقط، ولا يُدّعى تتبّع مباشر.
 */
export async function createShipmentAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("shipping.manage");
  const orderNumber = str(formData, "orderNumber");
  const companyId = str(formData, "companyId");

  const order = await findOrderByNumber(orderNumber);
  if (!order) redirect("/admin/orders");

  const result = await createShipmentForOrder(order, companyId);

  await writeAudit(
    { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
    { action: "update", entity: "shipment", entityId: orderNumber, summary: result.message },
  );

  revalidatePath("/admin/orders");
  revalidatePath("/admin/shipping");
  revalidatePath(orderHref(orderNumber));
  redirect(orderHref(orderNumber, "ship=" + encodeURIComponent(result.message)));
}