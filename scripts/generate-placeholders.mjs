/**
 * توليد صور Placeholder محلية (بدون أي صور من الإنترنت).
 * كل الصور المنتجة ملك المشروع (مرخّصة للاستخدام داخله).
 *
 * التشغيل:  npm run placeholders
 * الناتج:   public/placeholders/*.svg
 *
 * لاحقًا: ارفع الصور الحقيقية إلى /public/products (أو Supabase Storage)
 * ثم غيّر حقل `image` و `images` في src/lib/data/products.ts فقط.
 */

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "placeholders");

/** كل المنتجات (24 منتجًا × 3 مناظر) */
const productSlugs = [
  "car-phone-mount",
  "car-charger",
  "usb-c-cable",
  "lightning-cable",
  "car-freshener",
  "cleaning-brush",
  "cable-organizer",
  "sun-shade",
  "tire-pump",
  "trunk-organizer",
  "magnetic-phone-mount",
  "dashboard-phone-holder",
  "cup-holder-organizer",
  "fast-charger-65w",
  "usb-c-cable-2m",
  "lightning-cable-2m",
  "usb-hub-splitter",
  "air-freshener-refill",
  "microfiber-cloth",
  "interior-cleaner-spray",
  "rear-window-sun-shade",
  "seat-gap-organizer",
  "first-aid-kit",
  "tire-gauge",
];

const productNames = {
  "car-phone-mount": "حامل موبايل للسيارة",
  "car-charger": "شاحن سيارة",
  "usb-c-cable": "كابل USB-C",
  "lightning-cable": "كابل Lightning",
  "car-freshener": "معطر سيارة",
  "cleaning-brush": "فرشاة تنظيف",
  "cable-organizer": "منظّم كابلات",
  "sun-shade": "ستارة شمس",
  "tire-pump": "منفاخ إطارات",
  "trunk-organizer": "منظم شنطة السيارة",
  "magnetic-phone-mount": "حامل موبايل مغناطيسي",
  "dashboard-phone-holder": "حامل لوح القيادة",
  "cup-holder-organizer": "منظّم كوب السيارة",
  "fast-charger-65w": "شاحن سريع 65W",
  "usb-c-cable-2m": "كابل USB-C 2 متر",
  "lightning-cable-2m": "كابل Lightning 2 متر",
  "usb-hub-splitter": "محول USB رباعي",
  "air-freshener-refill": "تعبئة معطر",
  "microfiber-cloth": "قطعة ميكروفايبر",
  "interior-cleaner-spray": "بخاخ تنظيف داخلي",
  "rear-window-sun-shade": "ستارة زجاج خلفي",
  "seat-gap-organizer": "منظّم فراغات المقاعد",
  "first-aid-kit": "حقيبة إسعافات أولية",
  "tire-gauge": "قياس ضغط الإطارات",
};

const views = [
  { suffix: "1", label: "منظر أمامي" },
  { suffix: "2", label: "منظر جانبي" },
  { suffix: "3", label: "تفصيل" },
];

const categories = [
  ["category-mounts", "تثبيت وتنظيم"],
  ["category-charging", "شحن وكابلات"],
  ["category-care", "عناية وراحة"],
  ["category-travel", "تنظيم وأدوات الطريق"],
];

const bundles = [
  ["bundle-road-pack", "باقة الطريق"],
  ["bundle-care-pack", "باقة العناية"],
  ["bundle-travel-pack", "باقة السفر"],
];

const FONT = "Cairo, 'Segoe UI', Tahoma, Arial, sans-serif";

function svg({ w = 800, h = 600, title, subtitle, kind = "منتج" }) {
  const cx = w / 2;
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title} — صورة مؤقتة">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#2b2d31"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0v40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect x="0" y="0" width="${w}" height="10" fill="#f97316"/>

  <rect x="${cx - 150}" y="${cy - 175}" width="300" height="215" rx="24" fill="#0a0a0b" stroke="#f97316" stroke-width="3" stroke-dasharray="14 10"/>
  <circle cx="${cx}" cy="${cy - 80}" r="46" fill="#f97316" fill-opacity="0.18" stroke="#f97316" stroke-width="3"/>
  <text x="${cx}" y="${cy - 68}" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="#f97316">AK</text>
  <text x="${cx}" y="${cy - 15}" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="#9ca0a7">${subtitle}</text>

  <text x="${cx}" y="${cy + 90}" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="800" fill="#ffffff">${title}</text>

  <rect x="${cx - 130}" y="${cy + 120}" width="260" height="42" rx="21" fill="#ffffff" fill-opacity="0.08"/>
  <text x="${cx}" y="${cy + 147}" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="#ff8a3d">${kind} — Placeholder</text>
</svg>
`;
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const jobs = [];

  for (const slug of productSlugs) {
    const name = productNames[slug] ?? slug;
    for (const view of views) {
      jobs.push([`product-${slug}-${view.suffix}`, svg({ title: name, subtitle: view.label })]);
    }
  }

  for (const [name, label] of categories) {
    jobs.push([name, svg({ w: 640, h: 480, title: label, subtitle: "قسم المنتجات", kind: "قسم" })]);
  }

  for (const [name, label] of bundles) {
    jobs.push([name, svg({ w: 960, h: 540, title: label, subtitle: "باقة منتجات", kind: "باقة" })]);
  }

  jobs.push([
    "banner-hero",
    svg({ w: 1600, h: 640, title: "AutoKit Egypt", subtitle: "إكسسوارات سيارات — عرض خاص", kind: "بانر" }),
  ]);

  for (const [name, content] of jobs) {
    await writeFile(path.join(OUT, `${name}.svg`), content, "utf8");
  }

  const files = await readdir(OUT);
  console.log(`✔ تم توليد ${files.length} صورة مؤقتة في public/placeholders/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
