import type { AdminRole, Permission } from "@/lib/admin/types";

/**
 * مصفوفة الصلاحيات لكل دور.
 * هذه هي المرجع على الخادم، وتُطابق سياسات RLS في قاعدة البيانات.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  // المالك: كل الصلاحيات
  owner: [
    "dashboard.view",
    "products.view",
    "products.write",
    "products.delete",
    "categories.manage",
    "bundles.manage",
    "media.view",
    "media.upload",
    "media.delete",
    "inventory.view",
    "inventory.update",
    "orders.view",
    "orders.update_status",
    "orders.delete",
    "customers.view",
    "coupons.view",
    "coupons.manage",
    "shipping.view",
    "shipping.manage",
    "returns.view",
    "returns.manage",
    "reviews.view",
    "reviews.manage",
    "content.manage",
    "settings.view",
    "settings.manage",
    "reports.view",
    "reports.profit",
    "roles.manage",
    "audit.view",
    "data.delete",
  ],

  // المدير: إدارة كاملة للعمليات والمحتوى — بلا أرباح/صلاحيات/حذف بيانات
  admin: [
    "dashboard.view",
    "products.view",
    "products.write",
    "categories.manage",
    "bundles.manage",
    "media.view",
    "media.upload",
    "media.delete",
    "inventory.view",
    "inventory.update",
    "orders.view",
    "orders.update_status",
    "customers.view",
    "coupons.view",
    "coupons.manage",
    "shipping.view",
    "shipping.manage",
    "returns.view",
    "returns.manage",
    "reviews.view",
    "reviews.manage",
    "content.manage",
    "settings.view",
    "reports.view",
    "audit.view",
  ],

  // موظف: تجهيز الطلبات والمخزون — بدون أرباح أو إعدادات أو صلاحيات
  staff: [
    "dashboard.view",
    "products.view",
    "media.view",
    "inventory.view",
    "inventory.update",
    "orders.view",
    "orders.update_status",
    "shipping.view",
    "returns.view",
    "returns.manage",
  ],

  // دعم: يرى الطلبات والعملاء ويتواصل — بدون أرباح أو مخزون أو أسرار
  support: [
    "dashboard.view",
    "orders.view",
    "customers.view",
    "returns.view",
    "reviews.view",
  ],
};

/** هل يملك الدور هذه الصلاحية؟ */
export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** هل يملك الدور أياً من الصلاحيات المطلوبة؟ */
export function canAny(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

/** قائمة صلاحيات الدور */
export function permissionsFor(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}