import type { Permission } from "@/lib/admin/types";

export interface AdminNavItem {
  href: string;
  label: string;
  /** الصلاحية المطلوبة لظهور/الوصول للصفحة */
  permission: Permission;
  icon: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** عناصر تنقّل لوحة التحكم — تُصفّى حسب صلاحيات الدور */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "الرئيسية",
    items: [{ href: "/admin", label: "لوحة القيادة", permission: "dashboard.view", icon: "▦" }],
  },
  {
    label: "البيع",
    items: [
      { href: "/admin/orders", label: "الطلبات", permission: "orders.view", icon: "🧾" },
      { href: "/admin/customers", label: "العملاء", permission: "customers.view", icon: "👤" },
      { href: "/admin/returns", label: "المرتجعات", permission: "returns.view", icon: "↩" },
      { href: "/admin/shipping", label: "الشحن", permission: "shipping.view", icon: "🚚" },
      { href: "/admin/coupons", label: "الكوبونات", permission: "coupons.view", icon: "％" },
    ],
  },
  {
    label: "الكتالوج",
    items: [
      { href: "/admin/products", label: "المنتجات", permission: "products.view", icon: "📦" },
      { href: "/admin/media", label: "الصور والفيديو", permission: "media.view", icon: "🖼" },
      { href: "/admin/inventory", label: "المخزون", permission: "inventory.view", icon: "🧮" },
      { href: "/admin/categories", label: "التصنيفات", permission: "categories.manage", icon: "🗂" },
      { href: "/admin/bundles", label: "الباقات", permission: "bundles.manage", icon: "🎁" },
      { href: "/admin/reviews", label: "التقييمات", permission: "reviews.view", icon: "★" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { href: "/admin/banners", label: "البنرات", permission: "content.manage", icon: "🪧" },
      { href: "/admin/faqs", label: "الأسئلة الشائعة", permission: "content.manage", icon: "❓" },
      { href: "/admin/policies", label: "السياسات", permission: "content.manage", icon: "📜" },
    ],
  },
  {
    label: "النظام",
    items: [
      { href: "/admin/reports", label: "التقارير", permission: "reports.view", icon: "📊" },
      { href: "/admin/settings", label: "الإعدادات", permission: "settings.view", icon: "⚙" },
      { href: "/admin/users", label: "المستخدمون والصلاحيات", permission: "roles.manage", icon: "🔐" },
      { href: "/admin/audit", label: "سجل النشاط", permission: "audit.view", icon: "📝" },
      { href: "/admin/health", label: "فحص النظام", permission: "settings.view", icon: "🩺" },
    ],
  },
];