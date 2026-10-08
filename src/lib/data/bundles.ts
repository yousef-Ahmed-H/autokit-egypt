import type { Bundle } from "@/lib/types";

/**
 * ⚠️ بيانات تجريبية (Demo) للباقات — الأسعار تقديرية للعرض فقط.
 * يمكن لاحقًا تخزين الباقات في جدول `bundles` داخل Supabase.
 */

export const bundles: Bundle[] = [
  {
    id: "b-001",
    slug: "road-pack",
    name: "باقة الطريق",
    tagline: "كل ما تحتاجه أثناء القيادة اليومية",
    description:
      "حامل الموبايل + الشاحن السريع + منفاخ الإطارات. تجهيز أساسي لأي رحلة داخل المدينة أو الطريق الصحراوي، بسعر أوفر من شرائهنها منفصلة.",
    productSlugs: ["car-phone-mount", "car-charger", "tire-pump"],
    price: 1149,
    originalPrice: 1327,
    image: "/placeholders/bundle-road-pack.svg",
    badge: "توفير 178 ج.م",
  },
  {
    id: "b-002",
    slug: "care-pack",
    name: "باقة العناية",
    tagline: "بيجك نظيف ومنعش طول الوقت",
    description:
      "معطر سيارة + فرشاة تنظيف + ستارة شمس. روتين متكامل للعناية بالمقصورة من الداخل وحمايتها من الشمس والغبار.",
    productSlugs: ["car-freshener", "cleaning-brush", "sun-shade"],
    price: 349,
    originalPrice: 417,
    image: "/placeholders/bundle-care-pack.svg",
    badge: "توفير 68 ج.م",
  },
  {
    id: "b-003",
    slug: "travel-pack",
    name: "باقة السفر",
    tagline: "رتب شنطتك وانطلق بثقة",
    description:
      "منظّم شنطة السيارة + منظّم الكابلات + كابل USB-C + ستارة شمس. كل ما يجعل الصندوق مرتبًا والجو داخل السيارة مريحًا في السفر.",
    productSlugs: ["trunk-organizer", "cable-organizer", "usb-c-cable", "sun-shade"],
    price: 649,
    originalPrice: 766,
    image: "/placeholders/bundle-travel-pack.svg",
    badge: "توفير 117 ج.م",
  },
];

export function getBundleBySlug(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug);
}
