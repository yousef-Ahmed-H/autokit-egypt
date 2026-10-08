import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/admin/json-store";
import type { AdminRole, AuditAction, AuditLog } from "@/lib/admin/types";

/**
 * سجل النشاط (Audit Log) — تطوير فقط.
 * عند ربط Supabase استبدله بجدول `audit_logs` (append-only).
 */

const store = createJsonStore<AuditLog[]>("audit-log.json", []);

export interface AuditActor {
  actorId?: string;
  actorEmail?: string;
  actorRole?: AdminRole;
}

export interface AuditEntry {
  action: AuditAction;
  entity: string;
  entityId?: string;
  summary: string;
}

/** كتابة حدث في سجل النشاط */
export async function writeAudit(actor: AuditActor | null, entry: AuditEntry): Promise<void> {
  const log: AuditLog = {
    id: randomUUID(),
    at: new Date().toISOString(),
    actorId: actor?.actorId ?? "system",
    actorEmail: actor?.actorEmail ?? "system",
    actorRole: actor?.actorRole ?? "owner",
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    summary: entry.summary,
    demo: true,
  };

  await store.update((current) => [log, ...current].slice(0, 500));
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const all = await store.read();
  return [...all].sort((a, b) => (a.at < b.at ? 1 : -1));
}

export async function listAuditLogsFor(entity: string, entityId: string): Promise<AuditLog[]> {
  const all = await listAuditLogs();
  return all.filter((l) => l.entity === entity && l.entityId === entityId);
}