import { createJsonStore } from "@/lib/admin/json-store";
import { products as baseProducts } from "@/lib/data/products";
import type { Product } from "@/lib/types";

/**
 * تعديلات لوحة التحكم على المنتجات (تطوير فقط).
 * تُخزَّن كـ Patch لكل منتج في `.data/product-overrides.json`،
 * ثم تُدمج مع البيانات الأساسية في طبقة الاستعلام (server-only).
 *
 * عند ربط Supabase تصبح هذه التعديلات هي صفوف جدول `products` الفعلية.
 */

const store = createJsonStore<Record<string, Partial<Product>>>("product-overrides.json", {});

export async function listOverrides(): Promise<Record<string, Partial<Product>>> {
  return store.read();
}

export async function getOverride(slug: string): Promise<Partial<Product> | null> {
  const all = await store.read();
  return all[slug] ?? null;
}

export async function saveProductOverride(slug: string, patch: Partial<Product>): Promise<void> {
  await store.update((current) => ({
    ...current,
    [slug]: { ...(current[slug] ?? {}), ...patch },
  }));
}

export async function clearProductOverride(slug: string): Promise<void> {
  await store.update((current) => {
    const next = { ...current };
    delete next[slug];
    return next;
  });
}

function merge(base: Product, override: Partial<Product> | undefined): Product {
  if (!override) return base;
  return { ...base, ...override };
}

/** كل المنتجات مع تطبيق تعديلات لوحة التحكم */
export async function getMergedProducts(): Promise<Product[]> {
  const overrides = await store.read();
  return baseProducts.map((p) => merge(p, overrides[p.slug]));
}

/** منتج واحد مدمج */
export async function getMergedProduct(slug: string): Promise<Product | null> {
  const base = baseProducts.find((p) => p.slug === slug);
  if (!base) return null;
  const overrides = await store.read();
  return merge(base, overrides[slug]);
}

/** قائمة slugs المنتجات الأساسية (للتوليد الثابت) */
export function baseProductSlugs(): string[] {
  return baseProducts.map((p) => p.slug);
}