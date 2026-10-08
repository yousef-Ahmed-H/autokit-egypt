/**
 * أنواع البيانات الأساسية للمتجر.
 * موحّدة بحيث يمكن استبدال مصدر البيانات (Demo ↔ Supabase)
 * دون تغيير الواجهات أو الصفحات.
 */

export type CategorySlug = "mounts" | "charging" | "care" | "travel";

/** حالة التوفر المعروضة للمستخدم */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** حالة المنتج الداخلية (تُستخدم لاحقًا في لوحة التحكم) */
export type ProductStatus = "active" | "draft" | "archived";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** معرّف أيقونة بسيطة (SVG داخلي) */
  icon: "mount" | "bolt" | "sparkle" | "bag";
  /** صورة قسم مؤقتة (Placeholder) */
  image: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** رمز المنتج (SKU) */
  sku: string;
  category: CategorySlug;
  /** السعر بالجنيه المصري (EGP) */
  price: number;
  /** سعر قبل الخصم (اختياري) */
  oldPrice?: number;
  shortDescription: string;
  description: string;
  /** المميزات */
  features: string[];
  /** طريقة الاستخدام */
  usage: string[];
  /** المواصفات والتصنيف */
  specs: Spec[];
  /** محتويات العبوة */
  packageIncludes: string[];
  /** التوافق */
  compatibility: string[];
  /** التحذيرات */
  warnings: string[];
  /** الضمان */
  warranty: string;

  /* ---- لوجستيات ---- */
  stock: number;
  /** الحد الأدنى للمخزون (تحته يظهر تنبيه "كمية محدودة") */
  minStock: number;
  /** الوزن بالكيلوجرام */
  weightKg: number;
  /** الأبعاد (عرض × عمق × ارتفاع) */
  dimensions: string;
  color: string;
  material: string;

  /* ---- وسائط ---- */
  /** الصورة الرئيسية */
  image: string;
  /** معرض الصور */
  images: string[];
  /** فيديو اختياري (رابط يوتيوب/تضمين) */
  videoUrl?: string;

  /* ---- تقييم ومبيعات ---- */
  rating: number;
  reviewsCount: number;
  /** عدد المبيعات (للترتيب حسب الأكثر مبيعًا) */
  salesCount: number;

  /* ---- حالة المنتج ---- */
  status: ProductStatus;
  badge?: string;
  /** تاريخ الإضافة — للترتيب حسب الأحدث */
  createdAt: string;

  /* ---- التسعير الداخلي (لا يُعرض للعملاء) ---- */
  /** سعر التكلفة — يُستخدم لحساب الأرباح فقط */
  costPrice?: number;

  /* ---- موافقة المشرف على المحتوى ----
   * لا تُعرض المواصفات/الادعاءات غير المؤكدة كحقائق على الموقع.
   * يُفعّلها المشرف صراحةً من لوحة التحكم. */
  verifiedSpecs?: boolean;
  verifiedContent?: boolean;
  /** تقييمات/مبيعات مؤكدة — لا تُعرض الأرقام الوهمية بدون تفعيلها */
  verifiedStats?: boolean;

  /** تفاصيل كل صورة: نص بديل، نوعها، ومصدرها */
  media?: ProductImageInfo[];
  /** أسئلة شائعة خاصة بالمنتج */
  faqs?: FaqItem[];
}

/** وصف صورة منتج (للالتزام بمصدر الصورة ونوعها) */
export interface ProductImageInfo {
  url: string;
  altAr: string;
  kind: "main" | "size" | "usage" | "gallery";
  source: string;
  sourceType: "real" | "illustrative";
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** معرّفات المنتجات داخل الباقة */
  productSlugs: string[];
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  text: string;
  productSlug?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

/** كوبون خصم تجريبي */
export interface Coupon {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSubtotal?: number;
  description: string;
}
