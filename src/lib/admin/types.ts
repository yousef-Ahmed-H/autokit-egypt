/**
 * لوحة التحكم — الأنواع والصلاحيات.
 *
 * ⚠️ مصدر الحقيقة الوحيد للصلاحيات هو `permissions.ts` على الخادم،
 * ويُطبَّق نفس الجدول في قاعدة البيانات (RLS) في `supabase/schema.sql`.
 * الواجهة تعرض/تخفي فقط؛ القرار النهائي دائمًا على الخادم.
 */

export type AdminRole = "owner" | "admin" | "staff" | "support";

export const ADMIN_ROLES: { key: AdminRole; name: string; description: string }[] = [
  { key: "owner", name: "المالك", description: "صلاحيات كاملة: الأرباح، الصلاحيات، حذف البيانات." },
  { key: "admin", name: "مدير", description: "إدارة المنتجات والطلبات والمخزون والمحتوى." },
  { key: "staff", name: "موظف تجهيز", description: "تجهيز الطلبات وتحديث حالتها والمخزون." },
  { key: "support", name: "دعم عملاء", description: "عرض الطلبات والتواصل مع العملاء — بدون أرباح أو أسرار." },
];

export const ROLE_NAME: Record<AdminRole, string> = ADMIN_ROLES.reduce(
  (acc, r) => ({ ...acc, [r.key]: r.name }),
  {} as Record<AdminRole, string>,
);

/** كل الصلاحيات في النظام */
export type Permission =
  | "dashboard.view"
  | "products.view"
  | "products.write"
  | "products.delete"
  | "categories.manage"
  | "bundles.manage"
  | "media.view"
  | "media.upload"
  | "media.delete"
  | "inventory.view"
  | "inventory.update"
  | "orders.view"
  | "orders.update_status"
  | "orders.delete"
  | "customers.view"
  | "coupons.view"
  | "coupons.manage"
  | "shipping.view"
  | "shipping.manage"
  | "returns.view"
  | "returns.manage"
  | "reviews.view"
  | "reviews.manage"
  | "content.manage"
  | "settings.view"
  | "settings.manage"
  | "reports.view"
  | "reports.profit"
  | "roles.manage"
  | "audit.view"
  | "data.delete";

export const PERMISSION_LABEL: Record<Permission, string> = {
  "dashboard.view": "عرض لوحة القيادة",
  "products.view": "عرض المنتجات",
  "products.write": "إضافة/تعديل المنتجات",
  "products.delete": "حذف المنتجات",
  "categories.manage": "إدارة التصنيفات",
  "bundles.manage": "إدارة الباقات",
  "media.view": "عرض مكتبة الصور",
  "media.upload": "رفع/استبدال الصور",
  "media.delete": "حذف الصور",
  "inventory.view": "عرض المخزون",
  "inventory.update": "تعديل المخزون",
  "orders.view": "عرض الطلبات",
  "orders.update_status": "تحديث حالة الطلب",
  "orders.delete": "حذف الطلبات",
  "customers.view": "عرض العملاء",
  "coupons.view": "عرض الكوبونات",
  "coupons.manage": "إدارة الكوبونات",
  "shipping.view": "عرض شركات الشحن",
  "shipping.manage": "إدارة شركات الشحن",
  "returns.view": "عرض المرتجعات",
  "returns.manage": "إدارة المرتجعات",
  "reviews.view": "عرض التقييمات",
  "reviews.manage": "إدارة التقييمات",
  "content.manage": "إدارة المحتوى (بنرات/أسئلة/سياسات)",
  "settings.view": "عرض الإعدادات",
  "settings.manage": "تعديل الإعدادات",
  "reports.view": "عرض التقارير",
  "reports.profit": "عرض الأرباح",
  "roles.manage": "إدارة الأدوار والصلاحيات",
  "audit.view": "عرض سجل النشاط",
  "data.delete": "حذف البيانات",
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  /** تجزئة كلمة المرور (scrypt) — لا تُعرض أبدًا */
  passwordHash: string;
  active: boolean;
  /** سر المصادقة الثنائية (TOTP) — إن وُجد تُطلب مصادقة ثانية عند الدخول */
  twoFactorSecret?: string;
  /** كل الحسابات في هذه المرحلة تجريبية */
  demo: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/** المستخدم بدون حقل كلمة المرور (للواجهة) */
export type AdminUserPublic = Omit<AdminUser, "passwordHash">;

export interface AdminSession {
  userId: string;
  role: AdminRole;
  email: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
}

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "upload"
  | "status_change";

export interface AuditLog {
  id: string;
  at: string;
  actorId: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: AuditAction;
  /** نوع الكيان (product, order, media, ...) */
  entity: string;
  entityId?: string;
  summary: string;
  demo: boolean;
}

export function toPublicUser(user: AdminUser): AdminUserPublic {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}