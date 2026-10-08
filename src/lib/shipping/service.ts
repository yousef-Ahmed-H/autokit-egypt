import { randomUUID } from "node:crypto";
import type { Order } from "@/lib/orders/types";
import { getShippingAdapter, NotConfiguredError } from "@/lib/shipping/adapter";
import {
  findCompany,
  findShipmentByOrder,
  findZoneByGovernorate,
  listShipments,
  saveShipment,
} from "@/lib/shipping/store";
import type { Shipment, ShipmentDraft, ShipmentStatus } from "@/lib/shipping/types";

/** سعر الشحن للمحافظة (نظام تجريبي قابل للتعديل من لوحة التحكم) */
export async function getShippingFee(governorate: string): Promise<number> {
  const zone = await findZoneByGovernorate(governorate);
  return zone?.shippingFee ?? 60;
}

export interface CreateShipmentInput {
  orderNumber: string;
  companyId: string;
  governorate: string;
  center: string;
  trackingNumber?: string;
  trackingUrl?: string;
  codAmount: number;
  notes?: string;
}

/**
 * إدخال شحنة يدويًا من لوحة التحكم.
 * لا يتصل بأي API — يحفظ البيانات فقط.
 */
export async function createManualShipment(input: CreateShipmentInput): Promise<Shipment> {
  const company = await findCompany(input.companyId);
  const existing = await findShipmentByOrder(input.orderNumber);
  if (existing) return existing;

  const timestamp = new Date().toISOString();
  const shipment: Shipment = {
    id: randomUUID(),
    orderNumber: input.orderNumber.trim(),
    companyId: input.companyId,
    adapter: company?.adapter ?? "manual",
    status: input.trackingNumber ? "created" : "draft",
    trackingNumber: input.trackingNumber?.trim() ?? "",
    trackingUrl: input.trackingUrl?.trim() ?? "",
    codAmount: input.codAmount,
    codCollected: false,
    governorate: input.governorate,
    center: input.center,
    notes: input.notes?.trim() ?? "",
    manual: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    demo: true,
  };
  await saveShipment(shipment);
  return shipment;
}

export interface AdapterShipmentOutcome {
  ok: boolean;
  shipment?: Shipment;
  message: string;
  live: boolean;
}

/**
 * إنشاء شحنة من طلب عبر الـ Adapter.
 * - الوضع اليدوي: يُطلب من المشرف إدخال رقم التتبع.
 * - الشركات الخارجية: ترفض الإرسال دون ضبط المفاتيح/موافقة المشرف.
 * لا تُرسل أي شحنة فعلية في هذه المرحلة.
 */
export async function createShipmentForOrder(
  order: Order,
  companyId: string,
): Promise<AdapterShipmentOutcome> {
  const company = await findCompany(companyId);
  if (!company) return { ok: false, message: "شركة الشحن غير موجودة", live: false };
  if (!company.active) return { ok: false, message: `شركة «${company.name}» غير مفعّلة`, live: false };

  const existing = await findShipmentByOrder(order.orderNumber);
  if (existing) {
    return { ok: true, shipment: existing, message: "توجد شحنة مسجّلة لهذا الطلب بالفعل", live: false };
  }

  const adapter = getShippingAdapter(company.adapter);
  const draft: ShipmentDraft = {
    orderNumber: order.orderNumber,
    customerName: order.address.fullName,
    customerPhone: order.address.phone,
    addressLine: `${order.address.street} — ${order.address.city}`,
    governorate: order.address.governorate,
    center: order.address.city,
    weightKg: 1,
    codAmount: order.totals.total,
    notes: order.address.notes,
  };

  try {
    const result = await adapter.createShipment(draft);
    if (!result.ok) {
      return { ok: false, message: result.error ?? "تعذّر إنشاء الشحنة", live: false };
    }

    if (adapter.id === "manual") {
      return {
        ok: true,
        message: "الوضع اليدوي: أدخل رقم الشحنة ورابط التتبع من صفحة الشحن.",
        live: false,
      };
    }

    // لا نصل إلى هنا في الوضع الحالي (الشركات الخارجية غير مفعّلة)
    const shipment = await createManualShipment({
      orderNumber: order.orderNumber,
      companyId,
      governorate: order.address.governorate,
      center: order.address.city,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      codAmount: order.totals.total,
    });
    return { ok: true, shipment, message: "تم إنشاء الشحنة", live: Boolean(result.live) };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return { ok: false, message: error.message, live: false };
    }
    return { ok: false, message: (error as Error).message, live: false };
  }
}

export interface UpdateShipmentInput {
  status?: ShipmentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  codCollected?: boolean;
  transferDate?: string;
  transferredAmount?: number;
  notes?: string;
}

export async function updateShipment(id: string, input: UpdateShipmentInput): Promise<Shipment | null> {
  const all = await listShipments();
  const current = all.find((s) => s.id === id);
  if (!current) return null;
  const next: Shipment = {
    ...current,
    status: input.status ?? current.status,
    trackingNumber: input.trackingNumber ?? current.trackingNumber,
    trackingUrl: input.trackingUrl ?? current.trackingUrl,
    codCollected: input.codCollected ?? current.codCollected,
    transferDate: input.transferDate ?? current.transferDate,
    transferredAmount: input.transferredAmount ?? current.transferredAmount,
    notes: input.notes ?? current.notes,
    updatedAt: new Date().toISOString(),
  };
  await saveShipment(next);
  return next;
}