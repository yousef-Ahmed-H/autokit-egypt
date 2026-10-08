"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { findReturn, updateReturn } from "@/lib/returns/store";
import type { ReturnStatus } from "@/lib/returns/types";

const STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "received", "refunded", "closed"];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string): number | null {
  const value = Number(str(formData, key));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function returnsHref(query = ""): string {
  return query ? `/admin/returns?${query}` : "/admin/returns";
}

export async function updateReturnAction(formData: FormData): Promise<void> {
  const admin = await assertPermission("returns.manage");
  const id = str(formData, "id");
  const statusRaw = str(formData, "status");
  const status = (STATUSES.includes(statusRaw as ReturnStatus) ? statusRaw : undefined) as ReturnStatus | undefined;

  if (!id) redirect(returnsHref("err=" + encodeURIComponent("طلب المرتجع غير موجود")));

  const existing = await findReturn(id);
  if (!existing) redirect(returnsHref("err=" + encodeURIComponent("طلب المرتجع غير موجود")));

  const result = await updateReturn(id, {
    status,
    adminNotes: str(formData, "adminNotes"),
    shippingCost: num(formData, "shippingCost") ?? existing.shippingCost,
    refundAmount: num(formData, "refundAmount") ?? existing.refundAmount,
    actorEmail: admin.email,
    historyNote: str(formData, "historyNote") || undefined,
  });

  if (result) {
    await writeAudit(
      { actorId: admin.userId, actorEmail: admin.email, actorRole: admin.role },
      { action: "update", entity: "return", entityId: id, summary: `تحديث طلب المرتجع ${id}` },
    );
  }

  revalidatePath("/admin/returns");
  redirect(returnsHref("ok=" + encodeURIComponent("تم تحديث طلب المرتجع")));
}