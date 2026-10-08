/**
 * طبقة الوصول للبيانات (Repository Layer).
 *
 * الوضع الحالي: بيانات Demo داخل `src/lib/data/*` + تعديلات لوحة التحكم
 * في `.data/product-overrides.json` (تُدمج هنا).
 *
 * الوضع القادم: استعلام من Supabase عبر الجداول في `supabase/schema.sql`.
 * كل الصفحات و API Routes تستدعي هذه الدوال فقط، لذلك ربط قاعدة البيانات
 * لاحقًا = تعديل هذا الملف فقط.
 */

import { bundles } from "@/lib/data/bundles";
import {
  DEMO_NOTICE,
  categories,
  getBestSellers,
  getCategory,
  getProductBySlug,
  getRelated,
  getNewestProducts,
  paginate,
  searchProducts,
  type ProductQuery,
} from "@/lib/data/products";
import { getMergedProducts } from "@/lib/admin/product-overrides";
import type { Bundle, Category, Product } from "@/lib/types";

export const dataSource = {
  /** true = نعرض بيانات Demo، false = بيانات من قاعدة البيانات */
  isDemo: true,
  notice: DEMO_NOTICE,
  engine: "demo" as "demo" | "supabase",
};

/** كل المنتجات مدموجة بتعديلات لوحة التحكم */
export async function getAllProducts(): Promise<Product[]> {
  return getMergedProducts();
}

/** قائمة المنتجات (بحث + تصفية + ترتيب) — منتجات منشورة فقط */
export async function listProducts(params: ProductQuery = {}): Promise<Product[]> {
  const all = await getMergedProducts();
  return searchProducts(params, all);
}

/** صفحة واحدة من المنتجات (12 منتجًا افتراضيًا) */
export async function getProductsPage(params: ProductQuery & { page?: number }) {
  const all = await listProducts(params);
  return paginate(all, params.page ?? 1);
}

export async function listCategories(): Promise<Category[]> {
  return categories;
}

export async function listBundles(): Promise<Bundle[]> {
  return bundles;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getMergedProducts();
  return getProductBySlug(slug, all) ?? null;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const all = await getMergedProducts();
  return all.find((p) => p.sku.toLowerCase() === sku.trim().toLowerCase()) ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getCategory(slug) ?? null;
}

export async function getBestSellingProducts(limit = 4): Promise<Product[]> {
  const all = await getMergedProducts();
  return getBestSellers(limit, all);
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  const all = await getMergedProducts();
  return getNewestProducts(limit, all);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getMergedProducts();
  return getRelated(product, limit, all);
}

/** عدد المنتجات المنشورة */
export async function countProducts(): Promise<number> {
  const all = await getMergedProducts();
  return all.filter((p) => p.status === "active").length;
}