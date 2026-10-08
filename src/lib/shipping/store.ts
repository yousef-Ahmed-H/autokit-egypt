import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/admin/json-store";
import { GOVERNORATES } from "@/lib/orders/types";
import { getShippingAdapter, listShippingAdapters } from "@/lib/shipping/adapter";
import type { Shipment, ShippingCompany, ShippingZone } from "@/lib/shipping/types";

/**
 * مخزن الشحن (تطوير فقط — ملف JSON).
 * عند ربط Supabase استبدله بجداول:
 *   shipping_companies, shipping_zones, shipping_centers, shipments
 */

const store = createJsonStore<{
  companies: ShippingCompany[];
  zones: ShippingZone[];
  shipments: Shipment[];
}>("shipping.json", { companies: [], zones: [], shipments: [] });

const now = () => new Date().toISOString();

function seedCompanies(): ShippingCompany[] {
  return listShippingAdapters().map((adapter, index) => ({
    id: randomUUID(),
    name: adapter.name,
    adapter: adapter.id,
    active: adapter.id === "manual",
    credentialsConfigured: adapter.isConfigured(),
    notes:
      adapter.id === "manual"
        ? "إدخال الشحنة ورقم التتبع يدويًا من لوحة التحكم."
        : "هيكل جاهز للربط — يتطلب ضبط المفاتيح وموافقة المشرف قبل أي إرسال.",
    createdAt: now(),
    demo: true,
  }));
}

function seedZones(): ShippingZone[] {
  return GOVERNORATES.map((governorate, index) => {
    const remote = ["مطروح", "الوادي الجديد", "شمال سيناء", "جنوب سيناء", "البحر الأحمر"].includes(
      governorate,
    );
    return {
      id: `zone-${index + 1}`,
      governorate,
      centers: [],
      villages: {},
      remoteAreas: [],
      shippingFee: remote ? 90 : 60,
      returnFee: remote ? 70 : 40,
      etaMinDays: remote ? 4 : 2,
      etaMaxDays: remote ? 7 : 5,
      codEnabled: true,
      active: true,
      demo: true,
    };
  });
}

let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  const data = await store.read();
  if (data.companies.length === 0 || data.zones.length === 0) {
    await store.write({
      companies: data.companies.length ? data.companies : seedCompanies(),
      zones: data.zones.length ? data.zones : seedZones(),
      shipments: data.shipments,
    });
  }
  seeded = true;
}

/* ---------- شركات الشحن ---------- */
export async function listCompanies(): Promise<ShippingCompany[]> {
  await ensureSeeded();
  const { companies } = await store.read();
  // حدّث حالة ضبط المفاتيح من البيئة في كل قراءة
  return companies.map((c) => ({
    ...c,
    credentialsConfigured: getShippingAdapter(c.adapter).isConfigured(),
  }));
}

export async function updateCompany(
  id: string,
  patch: Partial<Pick<ShippingCompany, "name" | "active" | "notes">>,
): Promise<void> {
  await store.update((data) => ({
    ...data,
    companies: data.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

export async function findCompany(id: string): Promise<ShippingCompany | null> {
  const companies = await listCompanies();
  return companies.find((c) => c.id === id) ?? null;
}

/* ---------- مناطق الشحن ---------- */
export async function listZones(): Promise<ShippingZone[]> {
  await ensureSeeded();
  const { zones } = await store.read();
  return zones;
}

export async function findZoneByGovernorate(governorate: string): Promise<ShippingZone | null> {
  const zones = await listZones();
  return zones.find((z) => z.governorate === governorate) ?? null;
}

export async function updateZone(
  id: string,
  patch: Partial<ShippingZone>,
): Promise<void> {
  await store.update((data) => ({
    ...data,
    zones: data.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
  }));
}

/* ---------- الشحنات ---------- */
export async function listShipments(): Promise<Shipment[]> {
  await ensureSeeded();
  const { shipments } = await store.read();
  return [...shipments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function findShipment(id: string): Promise<Shipment | null> {
  const shipments = await listShipments();
  return shipments.find((s) => s.id === id) ?? null;
}

export async function findShipmentByOrder(orderNumber: string): Promise<Shipment | null> {
  const shipments = await listShipments();
  return shipments.find((s) => s.orderNumber === orderNumber) ?? null;
}

export async function saveShipment(shipment: Shipment): Promise<void> {
  await store.update((data) => {
    const exists = data.shipments.some((s) => s.id === shipment.id);
    return {
      ...data,
      shipments: exists
        ? data.shipments.map((s) => (s.id === shipment.id ? shipment : s))
        : [...data.shipments, shipment],
    };
  });
}

export async function deleteShipment(id: string): Promise<void> {
  await store.update((data) => ({
    ...data,
    shipments: data.shipments.filter((s) => s.id !== id),
  }));
}

export { randomUUID };