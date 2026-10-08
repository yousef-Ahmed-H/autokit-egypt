import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listUsers } from "@/lib/admin/users-store";

export const metadata: Metadata = { title: "المستخدمون والصلاحيات" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePermission("roles.manage");
  const users = await listUsers();

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">النظام</p>
        <h1 className="h-section">المستخدمون والصلاحيات</h1>
        <p className="mt-1 text-sm text-ink-500">
          الدور/الصلاحيات تُدار من الكود (`ROLE_PERMISSIONS`). إصدار CRUD كامل للمستخدمين يأتي مع ربط Supabase لاحقًا.
        </p>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-ink-50 text-[0.72rem] text-ink-500">
            <tr>
              <th scope="col" className="p-3 text-start">الاسم</th>
              <th scope="col" className="p-3 text-start">البريد</th>
              <th scope="col" className="p-3 text-start">الدور</th>
              <th scope="col" className="p-3 text-start">نشط</th>
              <th scope="col" className="p-3 text-start">ديمو</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3" dir="ltr">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.active ? "نعم" : "لا"}</td>
                <td className="p-3">{u.demo ? "نعم" : "لا"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}