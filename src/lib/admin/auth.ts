import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { can } from "@/lib/admin/permissions";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "@/lib/admin/session";
import type { AdminSession, AdminUser, Permission } from "@/lib/admin/types";
import type { AdminRole } from "@/lib/admin/types";
import { findUserById } from "@/lib/admin/users-store";

/**
 * حماية الخادم (Backend) — كل صفحة/إجراء إداري يجب أن يمر من هنا.
 * لا يُعتمد على إخفاء عناصر الواجهة إطلاقًا.
 */

export class ForbiddenError extends Error {
  constructor(public permission: Permission) {
    super(`ممنوع: الصلاحية المطلوبة (${permission})`);
    this.name = "ForbiddenError";
  }
}

/**
 * قراءة المستخدم الحالي: تتحقق من التوقيع ثم تقرأ الدور **الحديث** من المخزن،
 * فتسري أي تغييرات في الدور أو تعطيل الحساب فورًا.
 */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(raw);
  if (!payload) return null;

  const user = await findUserById(payload.userId);
  if (!user || !user.active) return null;

  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  };
}

/** يفرض وجود جلسة صالحة، وإلا يعيد التوجيه لصفحة الدخول */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** يفرض جلسة + صلاحية محددة (لصفحات العرض) */
export async function requirePermission(permission: Permission): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) redirect("/admin?denied=1");
  return admin;
}

/** يفرض صلاحية داخل Server Actions (يرمي خطأ بدل التوجيه) */
export async function assertPermission(permission: Permission): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new ForbiddenError(permission);
  if (!can(admin.role, permission)) throw new ForbiddenError(permission);
  return admin;
}

/** إنشاء الجلسة (يُستدعى من Server Action فقط) */
export async function startSession(user: AdminUser): Promise<void> {
  const { token, maxAge } = createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

/** إنهاء الجلسة */
export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export type { AdminRole };