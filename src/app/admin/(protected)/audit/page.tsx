import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listAuditLogs } from "@/lib/admin/audit";

export const metadata: Metadata = { title: "سجل النشاط" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requirePermission("audit.view");
  const logs = await listAuditLogs();

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">النظام</p>
        <h1 className="h-section">سجل النشاط (Audit Log)</h1>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-2 text-start">التاريخ/الوقت</th>
              <th scope="col" className="p-2 text-start">المستخدم</th>
              <th scope="col" className="p-2 text-start">الإجراء</th>
              <th scope="col" className="p-2 text-start">الكيان</th>
              <th scope="col" className="p-2 text-start">ملخص</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="p-2" dir="ltr">{l.at.slice(0, 19).replace("T", " ")}</td>
                <td className="p-2 text-ink-600">{l.actorEmail ?? "system"}</td>
                <td className="p-2">{l.action}</td>
                <td className="p-2">{l.entity}{l.entityId ? `:${l.entityId.slice(0, 8)}` : ""}</td>
                <td className="p-2 max-w-[360px] truncate">{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}