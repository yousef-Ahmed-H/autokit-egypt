import { createJsonStore } from "@/lib/admin/json-store";
import { faqGroups as defaultFaqs } from "@/lib/data/content";
import type { FaqGroup } from "@/lib/types";

/**
 * محتوى الموقع القابل للتعديل من لوحة التحكم:
 * سياسات الشحن والاسترجاع، الأسئلة الشائعة، والبنرات.
 * (تطوير فقط — JSON — يُستبدل بجدول `site_settings` / `site_content`).
 */

export type PolicySlug = "shipping" | "returns" | "privacy" | "terms";

export interface Policy {
  slug: PolicySlug;
  title: string;
  /** نص عادي، فقرات مفصولة بسطر فارغ */
  body: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  text: string;
  href: string;
  active: boolean;
  order: number;
}

interface ContentData {
  policies: Policy[];
  banners: Banner[];
  faqs: FaqGroup[];
}

const DEFAULT_POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "سياسة الشحن والتوصيل",
    body: [
      "يتم التوصيل إلى جميع محافظات مصر عبر شركات شحن معتمدة. (الأسعار والمدد التالية تجريبية وقابلة للتعديل من لوحة التحكم).",
      "تختلف رسوم الشحن حسب المحافظة والمنطقة (مركز/قرية/منطقة بعيدة)، وتُعرض بوضوح عند إتمام الطلب قبل التأكيد.",
      "مدة التوصيل المعتادة من يومين إلى خمسة أيام عمل حسب المحافظة، وقد تزيد للمناطق البعيدة.",
      "يمكن الدفع عند الاستلام (COD) في معظم المناطق، ويُحصّل مندوب التوصيل قيمة الطلب عند التسليم.",
      "ملاحظة: تتبع الشحنة يُدار حاليًا بشكل يدوي من لوحة التحكم، وليس تتبعًا مباشرًا من شركة الشحن.",
    ].join("\n\n"),
    updatedAt: new Date(0).toISOString(),
  },
  {
    slug: "returns",
    title: "سياسة الاستبدال والاسترجاع",
    body: [
      "يمكن طلب الاستبدال أو الاسترجاع خلال 14 يومًا من الاستلام إذا كان المنتج بحالته الأصلية وبكامل ملحقاته.",
      "يُقدَّم طلب الاسترجاع مع سبب واضح، ويُفضّل إرفاق صور توضّح المشكلة إن وُجدت.",
      "يراجع المشرف الطلب ويقرر القبول أو الرفض، وتُسجَّل كل خطوة في سجل العملية.",
      "عند القبول تُحدَّد تكلفة الشحن والمبلغ المسترد، ويتم رد المبلغ بنفس طريقة الدفع.",
      "قد لا يُقبل الاسترجاع للمنتجات التي تلفت بسبب سوء الاستخدام بعد الاستلام.",
    ].join("\n\n"),
    updatedAt: new Date(0).toISOString(),
  },
  {
    slug: "privacy",
    title: "سياسة الخصوصية",
    body: [
      "نجمع أقل قدر من البيانات اللازمة لإتمام الطلب: الاسم، رقم الموبايل، والعنوان.",
      "تُستخدم البيانات لتأكيد الطلب والتوصيل فقط، ولا تُباع لأي طرف ثالث.",
      "في النسخة التجريبية تُحفظ البيانات محليًا لأغراض العرض فقط.",
    ].join("\n\n"),
    updatedAt: new Date(0).toISOString(),
  },
  {
    slug: "terms",
    title: "الشروط والأحكام",
    body: [
      "باستخدامك المتجر فإنك توافق على هذه الشروط.",
      "السعر المعروض وقت الطلب هو السعر المعتمد، وتُحفظ لقطة بالسعر والعنوان داخل الطلب.",
      "الأسعار الموجودة في النسخة التجريبية للعرض فقط وقابلة للتعديل من لوحة التحكم.",
    ].join("\n\n"),
    updatedAt: new Date(0).toISOString(),
  },
];

interface ContentData {
  policies: Policy[];
  banners: Banner[];
  faqs: FaqGroup[];
}

const store = createJsonStore<ContentData>("content.json", {
  policies: [],
  banners: [],
  faqs: [],
});

function seedPolicies(): Policy[] {
  const now = new Date().toISOString();
  return DEFAULT_POLICIES.map((p) => ({ ...p, updatedAt: now }));
}

let seeded = false;
async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const data = await store.read();
  if (data.policies.length === 0 || data.faqs.length === 0) {
    await store.write({
      policies: data.policies.length ? data.policies : defaultPolicies(),
      banners: data.banners,
      faqs: data.faqs.length ? data.faqs : defaultFaqs,
    });
  }
  seeded = true;
}

function defaultPolicies(): Policy[] {
  return DEFAULT_POLICIES;
}

export async function listPolicies(): Promise<Policy[]> {
  await ensureSeeded();
  const { policies } = await store.read();
  return policies;
}

export async function getPolicy(slug: PolicySlug): Promise<Policy | null> {
  const policies = await listPolicies();
  return policies.find((p) => p.slug === slug) ?? null;
}

export async function savePolicy(
  slug: PolicySlug,
  patch: { title?: string; body?: string },
): Promise<Policy | null> {
  let updated: Policy | null = null;
  await store.update((data) => ({
    ...data,
    policies: data.policies.map((p) => {
      if (p.slug !== slug) return p;
      updated = {
        ...p,
        title: patch.title ?? p.title,
        body: patch.body ?? p.body,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }),
  }));
  return updated;
}

export async function listContentFaqs(): Promise<FaqGroup[]> {
  await ensureSeeded();
  const { faqs } = await store.read();
  return faqs;
}

export async function saveContentFaqs(faqs: FaqGroup[]): Promise<void> {
  await store.update((data) => ({ ...data, faqs }));
}

export async function listBanners(): Promise<Banner[]> {
  await ensureSeeded();
  const { banners } = await store.read();
  return [...banners].sort((a, b) => a.order - b.order);
}

export async function saveBanners(banners: Banner[]): Promise<void> {
  await store.update((data) => ({ ...data, banners }));
}