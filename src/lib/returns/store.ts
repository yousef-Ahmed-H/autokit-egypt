import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/admin/json-store";
import type { ReturnHistoryEntry, ReturnRequest, ReturnStatus } from "@/lib/returns/types";

/** مخزن المرتجعات (تطوير فقط). يُستبدل بجدول `return_requests` + `return_history`. */

const store = createJsonStore<ReturnRequest[]>("returns.json", []);

export interface CreateReturnInput {
  orderNumber: string;
  phone: string;
  customerName: string;
  reasonCategory: string;
  reasonText: string;
  images?: string[];
  /** من أنشأ الطلب (customer أو بريد المشرف) */
  actor: string;
}

export async function createReturnRequest(input: CreateReturnInput): Promise<ReturnRequest> {
  const now = new Date().toISOString();
  const request: ReturnRequest = {
    id: randomUUID(),
    orderNumber: input.orderNumber.trim(),
    phone: input.phone.replace(/\D/g, ""),
    customerName: input.customerName.trim(),
    reasonCategory: input.reasonCategory,
    reasonText: input.reasonText.trim(),
    images: (input.images ?? []).filter(Boolean),
    status: "requested",
    adminNotes: "",
    shippingCost: 0,
    refundAmount: 0,
    history: [
      { at: now, by: input.customerName || "العميل", action: "إنشاء طلب استرجاع", note: input.reasonText },
    ],
    createdAt: now,
    updatedAt: now,
    demo: true,
  };
  await store.update((current) => [request, ...current]);
  return request;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function listReturns(): Promise<ReturnRequest[]> {
  const all = await store.read();
  return [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function findReturn(id: string): Promise<ReturnRequest | null> {
  const all = await store.read();
  return all.find((r) => r.id === id) ?? null;
}

export interface UpdateReturnInput {
  status?: ReturnStatus;
  adminNotes?: string;
  shippingCost?: number;
  refundAmount?: number;
  actorEmail?: string;
  historyNote?: string;
}

export async function updateReturn(id: string, input: UpdateReturnInput): Promise<ReturnRequest | null> {
  let updated: ReturnRequest | null = null;
  await store.update((all) =>
    all.map((r) => {
      if (r.id !== id) return r;
      const history: ReturnHistoryEntry[] = [...r.history];
      if (input.status && input.status !== r.status) {
        history.push({
          at: new Date().toISOString(),
          by: input.actorEmail ?? "admin",
          action: `تغيير الحالة إلى: ${input.status}`,
          note: input.historyNote,
        });
      } else if (input.historyNote) {
        history.push({
          at: new Date().toISOString(),
          by: input.actorEmail ?? "admin",
          action: "ملاحظة",
          note: input.historyNote,
        });
      }
      updated = {
        ...r,
        status: input.status ?? r.status,
        adminNotes: input.adminNotes ?? r.adminNotes,
        shippingCost: input.shippingCost ?? r.shippingCost,
        refundAmount: input.refundAmount ?? r.refundAmount,
        history,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }),
  );
  return updated;
}