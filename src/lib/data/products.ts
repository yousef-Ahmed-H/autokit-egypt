import type { Category, Product, StockStatus } from "@/lib/types";

/**
 * ⚠️ بيانات تجريبية (Demo Data) — ليست بيانات بيع حقيقية.
 * الأسعار والمخزون والتقييمات والمبيعات كلها تقديرية لأغراض العرض فقط.
 *
 * عند ربط قاعدة البيانات (Supabase) استبدل هذا الملف بنتائج الاستعلام
 * من `src/lib/db/queries.ts` — الواجهات لن تتغيّر لأن الأنواع واحدة.
 *
 * الصور: Placeholders محلية مولّدة من `scripts/generate-placeholders.mjs`.
 * لرفع صور حقيقية: ضعها في /public/products ثم غيّر حقل `image`/`images`.
 */

export const DEMO_NOTICE = "بيانات تجريبية للعرض فقط — ليست منتجات أو أسعار حقيقية.";

export const PAGE_SIZE = 12;

/* ------------------------------------------------------------------ */
/* الأقسام                                                             */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    slug: "mounts",
    name: "تثبيت وتنظيم",
    description: "حوامل الموبايل ومنظّمات الكابلات لتثبيت أجهزتك في مكانها.",
    icon: "mount",
    image: "/placeholders/category-mounts.svg",
  },
  {
    slug: "charging",
    name: "شحن وكابلات",
    description: "شواحن سيارة وكابلات USB-C و Lightning سريعة وآمنة.",
    icon: "bolt",
    image: "/placeholders/category-charging.svg",
  },
  {
    slug: "care",
    name: "عناية وراحة",
    description: "معطرات وتنظيف وستائر شمس تحافظ على راحة بيجك ونظافته.",
    icon: "sparkle",
    image: "/placeholders/category-care.svg",
  },
  {
    slug: "travel",
    name: "تنظيم وأدوات الطريق",
    description: "منظّمات الشنط وحقيبة الإسعاف ومنفاخ الإطارات لتجهيز السيارة.",
    icon: "bag",
    image: "/placeholders/category-travel.svg",
  },
];

/* ------------------------------------------------------------------ */
/* مساعدات بناء المنتج                                                 */
/* ------------------------------------------------------------------ */

type Seed = Omit<Product, "image" | "images" | "warnings" | "warranty" | "minStock" | "status" | "createdAt"> &
  Partial<Pick<Product, "warnings" | "warranty" | "minStock" | "status" | "createdAt">>;

const DEFAULT_WARNINGS = [
  "يُحفظ بعيدًا عن أشعة الشمس المباشرة ودرجات الحرارة العالية داخل السيارة.",
  "لا تُستخدم المنتجات لأي غرض غير المخصص له في ورقة الإرشاد.",
  "قد تختلف الألوان قليلًا حسب إعدادات الشاشة (الصور الحالية Placeholders).",
  "راجع التوافق مع طراز سيارتك قبل الطلب.",
];

const DEFAULT_WARRANTY =
  "ضمان استبدال ضد عيوب التصنيع لمدة 6 أشهر من تاريخ الاستلام (بيانات تجريبية).";

/** معرض الصور المؤقت — 3 مناظر لكل منتج */
function gallery(slug: string): string[] {
  return [1, 2, 3].map((n) => `/placeholders/product-${slug}-${n}.svg`);
}

function makeProduct(seed: Seed): Product {
  const images = gallery(seed.slug);
  return {
    minStock: 5,
    status: "active",
    createdAt: "2026-01-01",
    warranty: DEFAULT_WARRANTY,
    warnings: DEFAULT_WARNINGS,
    ...seed,
    image: images[0],
    images,
  };
}

/** حالة المخزون للمستخدم */
export function stockStatus(product: Pick<Product, "stock" | "minStock">): StockStatus {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= product.minStock) return "low_stock";
  return "in_stock";
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "متوفر",
  low_stock: "كمية محدودة",
  out_of_stock: "نفد المخزون",
};

/* ------------------------------------------------------------------ */
/* المنتجات                                                            */
/* ------------------------------------------------------------------ */

export const products: Product[] = [
  makeProduct({
    id: "p-001",
    slug: "car-phone-mount",
    name: "حامل موبايل للسيارة",
    sku: "AK-MNT-001",
    category: "mounts",
    price: 249,
    oldPrice: 299,
    shortDescription: "تثبيت قوي بالكعب والشاشة مع دوران 360° ويد واحدة.",
    description:
      "حامل موبايل عملي يثبت على فتحة التكييف أو الزجاج بمسامير قوية، يسمح بالتحكم في الهاتف بيد واحدة أثناء القيادة مع دعم زاوية 360 درجة لعرض الخريطة بوضوح. متوافق مع معظم هواتف Android و iPhone بعرض حتى 9 سم.",
    features: [
      "تثبيت لاهتزازه حتى على الطرق غير المستوية",
      "يد واحدة للإغلاق والفتح مع تثبيت تلقائي",
      "تدوير 360° وزاوية ميل قابلة للتعديل",
      "أطراف سيليكون لا تخدش الهاتف ولا تترك أثرًا",
    ],
    usage: [
      "ثبّت القاعدة داخل فتحة التكييف أو على الزجاج باللواصق المرفقة.",
      "افتح ذراعي الحامل بدفعهما للجانبين وضع الهاتف بينهما.",
      "اضبط الزاوية والدوران المطلوب ثم ابدأ القيادة.",
    ],
    specs: [
      { label: "التصنيف", value: "إكسسوارات تثبيت" },
      { label: "المادة", value: "بلاستيك ABS + سيليكون" },
      { label: "نوع التثبيت", value: "فتحة التكييف / لاصق زجاج" },
      { label: "نطاق العرض", value: "5.5 – 9 سم" },
      { label: "اللون", value: "أسود مطفي" },
    ],
    packageIncludes: ["حامل الموبايل", "قاعدة تثبيت احتياطية", "دليل الاستخدام"],
    compatibility: [
      "هواتف Android بعرض 5.5–9 سم",
      "iPhone 6 وما فوق (بدون جراب سميك جدًا)",
      "معظم طرازات السيارات ذات فتحات التكييف القياسية",
    ],
    color: "أسود",
    material: "ABS + سيليكون",
    weightKg: 0.18,
    dimensions: "12 × 8 × 6 سم",
    rating: 4.7,
    reviewsCount: 128,
    salesCount: 486,
    stock: 42,
    badge: "الأكثر مبيعًا",
    createdAt: "2025-11-05",
  }),
  makeProduct({
    id: "p-002",
    slug: "car-charger",
    name: "شاحن سيارة",
    sku: "AK-CHG-002",
    category: "charging",
    price: 329,
    oldPrice: 379,
    shortDescription: "شاحن سريع بمنفذين PD 30W مع حماية من ارتفاع الحرارة.",
    description:
      "شاحن سيارة بمنفذين يشحن الهاتف والجهاز اللوحي معًا بقوة حتى 30 واط، مبني بشرائح حماية ضد ارتفاع الجهد والحرارة وقصر الدائرة، ليبقى جهازك آمنًا أثناء الشحن السريع في الطريق.",
    features: [
      "شحن سريع PD 30W + منفذ USB-A سريع",
      "حماية متعددة: حرارة، جهد، تيار زائد",
      "تصميم صغير لا يشغل مقبس الفيشة",
      "مؤشر LED هادئ لا يزعج أثناء القيادة",
    ],
    usage: [
      "أدخل الشاحن في مقبس الـ 12V/24V بالسيارة.",
      "وصّل الكابل بالمنفذ المناسب (USB-C PD أو USB-A).",
      "ضع الجهاز في الشحن وتأكد من ظهور مؤشر الشحن.",
    ],
    specs: [
      { label: "التصنيف", value: "شحن السيارة" },
      { label: "المدخل", value: "12V – 24V (ركاب وباصات)" },
      { label: "المخرج", value: "USB-C PD 30W + USB-A 18W" },
      { label: "الحماية", value: "حرارة / جهد / تيار زائد" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["شاحن السيارة", "ضمان استبدال 6 أشهر (تجريبي)"],
    compatibility: [
      "الأجهزة الداعمة لـ PD و Quick Charge",
      "هواتف Android و iPhone (بعوامل تحويل)",
      "سيارات 12V و 24V",
    ],
    color: "أسود",
    material: "ABS مقاوم للحرارة",
    weightKg: 0.06,
    dimensions: "6 × 3 × 2.5 سم",
    rating: 4.8,
    reviewsCount: 96,
    salesCount: 394,
    stock: 35,
    badge: "شحن سريع",
    createdAt: "2025-11-12",
  }),
  makeProduct({
    id: "p-003",
    slug: "usb-c-cable",
    name: "كابل USB-C",
    sku: "AK-CBL-003",
    category: "charging",
    price: 149,
    shortDescription: "كابل USB-C إلى USB-C بطول 1 متر وشحن 60W.",
    description:
      "كابل USB-C مقوى بغطاء نايلون مضفّر وطرفين معدنيين يتحمّل أكثر من 10,000 ثنية، يدعم الشحن السريع حتى 60 واط ونقل البيانات بسرعة 480Mbps.",
    features: [
      "شحن سريع حتى 60W (PD)",
      "نايلون مضفّر مقاوم للتمزق",
      "أطراف معدنية بتصميم يمنع الانحناء",
      "طول 1 متر — مناسب للكونسول والشاحن",
    ],
    usage: [
      "وصّل الطرف بالشاحن والطرف الآخر بالجهاز.",
      "تجنّب لفّ الكابل بزاوية حادة لتطويل عمره.",
      "نظّف الأطراف جافًا عند الاتصال بالغبار.",
    ],
    specs: [
      { label: "التصنيف", value: "كابلات" },
      { label: "النوع", value: "USB-C إلى USB-C" },
      { label: "الطول", value: "1 متر" },
      { label: "القدرة", value: "حتى 60W" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["كابل USB-C", "رباط تنظيم"],
    compatibility: [
      "Galaxy S/Note و Pixel وiPad Pro و MacBook",
      "أي منفذ USB-C يدعم PD",
      "الشواحن السريعة 30W/45W/60W",
    ],
    color: "أسود",
    material: "نايلون مضفّر + أطراف ألمنيوم",
    weightKg: 0.05,
    dimensions: "100 × 1.2 × 0.6 سم",
    rating: 4.6,
    reviewsCount: 74,
    salesCount: 352,
    stock: 120,
    createdAt: "2025-12-01",
  }),
  makeProduct({
    id: "p-004",
    slug: "lightning-cable",
    name: "كابل Lightning",
    sku: "AK-CBL-004",
    category: "charging",
    price: 159,
    shortDescription: "كابل Lightning معتمد MFi بطول 1 متر وشحن 20W.",
    description:
      "كابل Lightning متوافق مع أجهزة iPhone بشهادة MFi، يدعم الشحن السريع حتى 20 واط ونقل البيانات، مع عصا تقوية عند الطرفين لمقاومة الانحناء اليومي.",
    features: [
      "متوافق MFi مع iPhone",
      "شحن سريع حتى 20W",
      "تقوية مضاعفة عند الطرفين",
      "طول 1 متر",
    ],
    usage: [
      "وصّل الطرف المخصص بالشاحن والطرف الآخر بمنفذ Lightning.",
      "يُفضّل استخدام شاحن 20W أو أعلى للشحن السريع.",
      "تجنّب سحب الكابل من الوصلة عند الفصل.",
    ],
    specs: [
      { label: "التصنيف", value: "كابلات" },
      { label: "النوع", value: "USB-C إلى Lightning" },
      { label: "الطول", value: "1 متر" },
      { label: "القدرة", value: "حتى 20W" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["كابل Lightning", "رباط تنظيم"],
    compatibility: [
      "iPhone 5 وما فوق حتى أحدث الطرازات",
      "AirPods و iPod",
      "شواحن USB-C بقدرة 20W",
    ],
    color: "أسود",
    material: "نايلون مضفّر + أطراف ألمنيوم",
    weightKg: 0.05,
    dimensions: "100 × 1.2 × 0.6 سم",
    rating: 4.5,
    reviewsCount: 61,
    salesCount: 287,
    stock: 64,
    createdAt: "2025-12-03",
  }),
  makeProduct({
    id: "p-005",
    slug: "car-freshener",
    name: "معطر سيارة",
    sku: "AK-CAR-005",
    category: "care",
    price: 99,
    oldPrice: 129,
    shortDescription: "معطر معلّق برائحة خفيفة تدوم 30 يومًا بدون لزوجة.",
    description:
      "معطر سيارة بتصميم أنيق يُعلّق خلف المرآة، يوزّع الرائحة تدريجيًا دون أن يترك أثرًا لزجًا على الزجاج أو لوحة القيادة، ورائحته خفيفة لا تسبب الإرهاق أثناء القيادة.",
    features: [
      "رائحة خفيفة تدوم حتى 30 يومًا",
      "بدون مواد لزجة على الزجاج",
      "سهل التبديل بتعبئة احتياطية",
      "تصميم أسود أنيق يناسب أي لوحة قيادة",
    ],
    usage: [
      "افتح غطاء العبوة وثبّت خيوط التبخير.",
      "علّقه خلف المرآة الداخلية بشكل مستقر.",
      "أغلقه مرة أخرى إن كانت الرائحة قوية جدًا.",
    ],
    specs: [
      { label: "التصنيف", value: "عناية وتعطير" },
      { label: "الحجم", value: "10 مل" },
      { label: "مدة التدوم", value: "≈ 30 يومًا" },
      { label: "الرائحة", value: "خشب صندل خفيف" },
      { label: "الاستخدام", value: "تعليق خلف المرآة" },
    ],
    packageIncludes: ["معطر السيارة", "تعبئة احتياطية"],
    compatibility: ["جميع السيارات ذات المرآة الداخلية المعلّقة"],
    color: "أسود / بني",
    material: "زجاج + خشب",
    weightKg: 0.09,
    dimensions: "8 × 3 × 3 سم",
    rating: 4.4,
    reviewsCount: 152,
    salesCount: 524,
    stock: 210,
    createdAt: "2025-11-20",
  }),
  makeProduct({
    id: "p-006",
    slug: "cleaning-brush",
    name: "فرشاة تنظيف",
    sku: "AK-CAR-006",
    category: "care",
    price: 129,
    shortDescription: "فرشاة ليفية ناعمة لتنظيف الشبك والحواف بدون خدوش.",
    description:
      "فرشاة تنظيف بشعيرات ناعمة وسِنان مطاطي تصل إلى الشبك والفتحات والحواف الضيقة داخل السيارة، وتحمّل الغسيل المائي والمنظفات دون أن تتفتّت.",
    features: [
      "شعيرات ناعمة لا تخدش البلاستيك",
      "سِنان مطاطي يصل للحواف الضيقة",
      "مقاس مناسب ليد واحدة",
      "مناسبة للاستخدام المائي والمنظفات",
    ],
    usage: [
      "بلّل المنطقة المطلوبة أو رشّ المنظف المناسب.",
      "مرّر الفرشاة بحركات خفيفة دون ضغط شديد.",
      "امسح المكان بقطعة قماش ميكروفايبر وجفّفه.",
    ],
    specs: [
      { label: "التصنيف", value: "أدوات تنظيف" },
      { label: "الطول", value: "28 سم" },
      { label: "المادة", value: "نيمرون + مقبض TPR" },
      { label: "الاستخدام", value: "داخلي وخارجي" },
      { label: "اللون", value: "أسود / رمادي" },
    ],
    packageIncludes: ["فرشاة التنظيف"],
    compatibility: ["جميع أنواع السيارات", "أسطح بلاستيكية وقماشية ومطاطية"],
    color: "أسود / رمادي",
    material: "نيمرون + TPR",
    weightKg: 0.12,
    dimensions: "28 × 5 × 4 سم",
    rating: 4.3,
    reviewsCount: 45,
    salesCount: 193,
    stock: 76,
    createdAt: "2025-12-10",
  }),
  makeProduct({
    id: "p-007",
    slug: "cable-organizer",
    name: "منظّم كابلات",
    sku: "AK-ORG-007",
    category: "mounts",
    price: 79,
    shortDescription: "3 قطع لاصقة تجمع الكابلات وتمنع تشابكها أمام الكونسول.",
    description:
      "منظمة كابلات لاصقة بثلاث قطع تثبت على لوحة القيادة أو جانب الكونسول، تحفظ رؤوس الكابلات في مكانها بحيث لا تسقط على الأرض ولا تتشابك أثناء القيادة.",
    features: [
      "3 قطع في العبوة",
      "لاصق 3M قوي قابل للإزالة بدون أثر",
      "تحمّل كابلات بعرض حتى 8 مم",
      "تثبت في أي زاوية مطلوبة",
    ],
    usage: [
      "نظّف السطح من الغبار والزيوت أولًا.",
      "الصق المنظّم واضغط 10 ثوانٍ للتثبيت.",
      "مرّر الكابل داخل الفتحة وأغلقها.",
    ],
    specs: [
      { label: "التصنيف", value: "إكسسوارات تنظيم" },
      { label: "الكمية", value: "3 قطع" },
      { label: "اللاصق", value: "3M قابل للإزالة" },
      { label: "اللون", value: "أسود" },
      { label: "المادة", value: "سيليكون" },
    ],
    packageIncludes: ["3 منظّمات كابلات", "مسحاة لاصق احتياطية"],
    compatibility: ["جميع السيارات", "كابلات حتى عرض 8 مم"],
    color: "أسود",
    material: "سيليكون",
    weightKg: 0.04,
    dimensions: "6 × 4 × 3 سم (للقطعة)",
    rating: 4.5,
    reviewsCount: 88,
    salesCount: 305,
    stock: 150,
    createdAt: "2025-12-15",
  }),
  makeProduct({
    id: "p-008",
    slug: "sun-shade",
    name: "ستارة شمس",
    sku: "AK-CAR-008",
    category: "care",
    price: 189,
    shortDescription: "ستارة شمس جانبية مغناطيسية للأبواب وحماية من الحرارة.",
    description:
      "ستارة شمس بطبقات عاكسة تقلل دخول الحرارة والأشعة للداخل وتمنع بهتان المقاعد، تركيبها بالنقاط المغناطيسية في ثوانٍ وتُطوى بسهولة عند عدم الاستخدام.",
    features: [
      "عكس حتى 99% من الأشعة فوق البنفسجية",
      "تركيب مغناطيسي في ثوانٍ",
      "تُطوى داخل جيب التخزين",
      "مناسبة للأبواب الجانبية والزجاج الخلفي",
    ],
    usage: [
      "أنزل الزجاج قليلًا وضع النقطة المغناطيسية على الإطار.",
      "ثبّت الستارة بحيث تغطي مساحة الزجاج بالكامل.",
      "ارفعها واطوِها داخل كيس التخزين عند عدم الاستخدام.",
    ],
    specs: [
      { label: "التصنيف", value: "حماية وراحة" },
      { label: "المقاس", value: "75 × 45 سم" },
      { label: "الطبقات", value: "3 طبقات عاكسة" },
      { label: "التركيب", value: "نقاط مغناطيسية" },
      { label: "اللون", value: "فضي / أسود" },
    ],
    packageIncludes: ["ستارة شمس", "كيس تخزين"],
    compatibility: ["الأبواب الجانبية لمعظم السيارات", "الزجاج الخلفي (بعض الطرازات)"],
    color: "فضي / أسود",
    material: "قماش عاكس + مغناطيس",
    weightKg: 0.22,
    dimensions: "75 × 45 × 1 سم",
    rating: 4.6,
    reviewsCount: 67,
    salesCount: 244,
    stock: 84,
    createdAt: "2026-01-08",
  }),
  makeProduct({
    id: "p-009",
    slug: "tire-pump",
    name: "منفاخ إطارات",
    sku: "AK-TIR-009",
    category: "travel",
    price: 749,
    oldPrice: 899,
    shortDescription: "منفاخ كهربائي محمول 12V بشاشة رقمية وإيقاف تلقائي.",
    description:
      "منفاخ إطارات كهربائي يعمل من مقبس الـ 12V في السيارة، يضبط الضغط المطلوب ويوقف التعبئة تلقائيًا، مع شاشة رقمية توضح ضغط الإطار بالـ PSI وأضواء طوارئ لليل.",
    features: [
      "إيقاف تلقائي عند الوصول للضغط المحدد",
      "شاشة رقمية للضغط PSI",
      "3 رؤوس لتغطية السيارة والدراجة والكرة",
      "أضواء LED للطوارئ الليلية",
    ],
    usage: [
      "وصّل السلك بمقبس 12V وشغّل الجهاز.",
      "اختر الضغط المطلوب (PSI) من الأزرار.",
      "وصّل الخرطوم بخزانة الإطار واضغط Start.",
    ],
    specs: [
      { label: "التصنيف", value: "أدوات الطريق" },
      { label: "التغذية", value: "12V من مقبس السيارة" },
      { label: "أقصى ضغط", value: "150 PSI" },
      { label: "الزمن", value: "≈ 5 دقائق لإطار سيارة" },
      { label: "الملحقات", value: "كيس تخزين + 3 رؤوس" },
    ],
    packageIncludes: ["منفاخ الإطارات", "3 رؤوس تفريغ", "كيس تخزين", "سلك 12V بطول 3 م"],
    compatibility: ["سيارات ودراجات نارية ودراجات هوائية وكرات"],
    color: "أسود",
    material: "ABS + معدن",
    weightKg: 1.1,
    dimensions: "24 × 16 × 9 سم",
    rating: 4.7,
    reviewsCount: 53,
    salesCount: 158,
    stock: 24,
    badge: "مميّز",
    createdAt: "2026-01-15",
  }),
  makeProduct({
    id: "p-010",
    slug: "trunk-organizer",
    name: "منظم شنطة السيارة",
    sku: "AK-ORG-010",
    category: "travel",
    price: 349,
    shortDescription: "منظّم مقسّم 6 أقسام قابل للطي يرتب الشنطة ويمنع التطاير.",
    description:
      "منظّم شنطة بستة أقسام جدارية قوية يرتب أغراض الصندوق ويمنع تطايرها أثناء الفرملة، يُطوى على شكل حقيبة عند عدم الاستخدام وله مقبض لحمله بسهولة.",
    features: [
      "6 أقسام + جيوب جانبية",
      "قواعد مانعة للانزلاق",
      "قابل للطي والتخزين",
      "مادة Oxford مقاومة للماء",
    ],
    usage: [
      "افتح المنظّم وثبّت الأقسام الجدارية.",
      "وزّع الأغراض حسب الفئات داخل الأقسام.",
      "اطوِه واحفظه عند عدم الاستخدام.",
    ],
    specs: [
      { label: "التصنيف", value: "تنظيم الصندوق" },
      { label: "المقاس", value: "55 × 35 × 30 سم" },
      { label: "المادة", value: "Oxford 600D" },
      { label: "الأقسام", value: "6 أقسام + جيوب جانبية" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["منظّم الشنطة", "حزام تثبيت"],
    compatibility: ["معظم صناديق السيارات (SUV وسيدان)", "الشاحنات الصغيرة"],
    color: "أسود",
    material: "Oxford 600D",
    weightKg: 0.85,
    dimensions: "55 × 35 × 30 سم",
    rating: 4.8,
    reviewsCount: 71,
    salesCount: 212,
    stock: 38,
    badge: "للأسر",
    createdAt: "2026-01-22",
  }),

  /* ---------------------- منتجات إضافية ---------------------- */

  makeProduct({
    id: "p-011",
    slug: "magnetic-phone-mount",
    name: "حامل موبايل مغناطيسي",
    sku: "AK-MNT-011",
    category: "mounts",
    price: 299,
    oldPrice: 349,
    shortDescription: "تثبيت مغناطيسي قوي بالكعب مع حلقة معدنية مجانًا.",
    description:
      "حامل مغناطيسي رقيق يثبت على الكعب أو الشاشة ويثبّت الهاتف بمحركات نيووديوم قوية، يسمح بالتثبيت والإزالة بحركة واحدة مع دوران كامل 360 درجة.",
    features: [
      "مغناطيس نيووديوم يثبت حتى 1.5 كجم",
      "سماكة صغيرة لا يحجب الرؤية",
      "يدعم الشحن اللاسلكي أثناء التثبيت",
      "دوران 360° وميل قابل للتعديل",
    ],
    usage: [
      "الصق القاعدة في المكان المطلوب واتركها 24 ساعة قبل الحمل.",
      "ألصق الحلقة المعدنية على ظهر الهاتف أو داخل الجراب.",
      "قرّب الهاتف من الحامل ليثبت تلقائيًا.",
    ],
    specs: [
      { label: "التصنيف", value: "إكسسوارات تثبيت" },
      { label: "المغناطيس", value: "نيوديوم N52" },
      { label: "نوع التثبيت", value: "لاصق 3M / كعب الشاشة" },
      { label: "الدوران", value: "360°" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["حامل مغناطيسي", "حلقة معدنية", "مسحة لاصق"],
    compatibility: [
      "جميع هواتف Android و iPhone",
      "يدعم الشحن اللاسلكي (مع الحلقة الرقيقة)",
      "أي طراز سيارة",
    ],
    color: "أسود",
    material: "ألمنيوم + نيووديوم",
    weightKg: 0.09,
    dimensions: "6 × 5 × 1.2 سم",
    rating: 4.8,
    reviewsCount: 94,
    salesCount: 318,
    stock: 55,
    badge: "جديد",
    createdAt: "2026-07-18",
  }),
  makeProduct({
    id: "p-012",
    slug: "dashboard-phone-holder",
    name: "حامل موبايل لوح القيادة",
    sku: "AK-MNT-012",
    category: "mounts",
    price: 219,
    shortDescription: "حامل يثبت على لوح القيادة بقاعدة مانعة للانزلاق.",
    description:
      "حامل موبايل بقاعدة عريضة مانعة للانزلاق تثبت على لوح القيادة بدون لواصق، يسمح برؤية كاملة للطريق مع إمكانية الفتح بيد واحدة ومناسب للهواتف الكبيرة.",
    features: [
      "قاعدة مطاطية مانعة للانزلاق بدون لاصق",
      "يفتح حتى عرض 9.5 سم",
      "تعتيم سطحي لا ينعكس على الزجاج",
      "تركيب وإزالة في ثوانٍ",
    ],
    usage: [
      "ضع القاعدة على سطح مستوٍ نظيف من لوح القيادة.",
      "افتح الذراعين وضع الهاتف داخلها.",
      "اضبط الزاوية قبل البدء في القيادة.",
    ],
    specs: [
      { label: "التصنيف", value: "إكسسوارات تثبيت" },
      { label: "القاعدة", value: "مطاط مانع للانزلاق" },
      { label: "نطاق العرض", value: "5.5 – 9.5 سم" },
      { label: "الدوران", value: "360°" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["حامل لوح القيادة"],
    compatibility: ["هواتف Android و iPhone حتى 9.5 سم", "لوحات قيادة مسطحة أو منحنية قليلًا"],
    color: "أسود",
    material: "ABS + مطاط",
    weightKg: 0.15,
    dimensions: "14 × 9 × 7 سم",
    rating: 4.4,
    reviewsCount: 52,
    salesCount: 147,
    stock: 60,
    createdAt: "2026-08-02",
  }),
  makeProduct({
    id: "p-013",
    slug: "cup-holder-organizer",
    name: "منظّم كوب السيارة",
    sku: "AK-ORG-013",
    category: "mounts",
    price: 139,
    shortDescription: "منظّم ينزل داخل مقبض الكوب ويحفظ الهاتف والقرطاسية.",
    description:
      "منظّم عملي ينزل داخل مقبض الكوب القياسي ليحوله إلى مساحة تنظيم للهاتف والقلم والإيصالات والأدوات الصغيرة، مع فتحة كابل شحن في الأمام.",
    features: [
      "يناسب مقبضات الكوب من 6.5 إلى 8 سم",
      "فتحة كابل شحن أمامية",
      "مادة مقاومة للسكب والتسريب",
      "قابل للفك والتنظيف",
    ],
    usage: [
      "أدخل المنظّم داخل مقبض الكوب حتى يستقر.",
      "وزّع الأغراض الصغيرة داخل الأقسام.",
      "مرّر كابل الشحن من الفتحة الأمامية.",
    ],
    specs: [
      { label: "التصنيف", value: "إكسسوارات تنظيم" },
      { label: "القطر", value: "6.5 – 8 سم" },
      { label: "العمق", value: "16 سم" },
      { label: "اللون", value: "أسود" },
      { label: "المادة", value: "بلاستيك مطفي" },
    ],
    packageIncludes: ["منظّم مقبض الكوب"],
    compatibility: ["معظم مقبضات الكوب القياسية في السيارات"],
    color: "أسود",
    material: "ABS",
    weightKg: 0.13,
    dimensions: "9 × 9 × 16 سم",
    rating: 4.3,
    reviewsCount: 38,
    salesCount: 96,
    stock: 70,
    createdAt: "2026-08-10",
  }),
  makeProduct({
    id: "p-014",
    slug: "fast-charger-65w",
    name: "شاحن سريع 65W",
    sku: "AK-CHG-014",
    category: "charging",
    price: 549,
    oldPrice: 649,
    shortDescription: "شاحن 65 واط بثلاثة منافذ يشحن اللابتوب والهاتف معًا.",
    description:
      "شاحن سريع بثلاثة منافذ (USB-C ×2 + USB-A) بقوة إجمالية 65 واط، يصلح لشحن اللابتوب والهاتف في آن واحد مع توزيع ذكي للقدرة وحماية حرارية كاملة.",
    features: [
      "قدرة 65W تدعم اللابتوبات",
      "3 منافذ مع توزيع ذكي للتيار",
      "تقنية PPS/PD 3.0 و QC 4+",
      "تصميم مطوي صغير للسفر",
    ],
    usage: [
      "وصّل الشاحن بمقبس كهرباء 100–240V.",
      "اختر المنفذ المدعوم لجهازك.",
      "لا تتجاوز الإجمالي 65W عند استخدام المنافذ معًا.",
    ],
    specs: [
      { label: "التصنيف", value: "شحن" },
      { label: "القدرة", value: "65W إجمالي" },
      { label: "المنافذ", value: "USB-C PD ×2 + USB-A" },
      { label: "المدخل", value: "100–240V 50/60Hz" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["الشاحن", "كابل USB-C بطول 1 م", "دليل الاستخدام"],
    compatibility: [
      "MacBook Air/Pro و laptops بمنفذ USB-C",
      "هواتف Android و iPhone الداعمة للشحن السريع",
      "أجهزة USB-A القديمة",
    ],
    color: "أسود",
    material: "PC مقاوم للهب",
    weightKg: 0.21,
    dimensions: "7 × 5 × 3 سم",
    rating: 4.9,
    reviewsCount: 41,
    salesCount: 182,
    stock: 30,
    badge: "شحن فائق",
    createdAt: "2026-09-01",
  }),
  makeProduct({
    id: "p-015",
    slug: "usb-c-cable-2m",
    name: "كابل USB-C بطول 2 متر",
    sku: "AK-CBL-015",
    category: "charging",
    price: 199,
    shortDescription: "كابل طويل يصل للركاب الخلفيين بشحن 100W.",
    description:
      "كابل USB-C بطول 2 متر يصل بكسلفة إلى المقاعد الخلفية أو التخزين الخلفي، يدعم الشحن حتى 100 واط ونقل البيانات مع هيكل مضفّر متين.",
    features: [
      "طول 2 متر يخدم المقاعد الخلفية",
      "شحن حتى 100W (PD 3.0)",
      "مضفّر نايلون مقاوم للانحناء",
      "مؤشر LED خفيف عند الطرف",
    ],
    usage: [
      "مرّر الكابل من الأمام للخلف عبر جانب المقعد.",
      "وصّل الطرفين بالشاحن والجهاز.",
      "استخدم الرباط المرفق لتنظيم الطول الزائد.",
    ],
    specs: [
      { label: "التصنيف", value: "كابلات" },
      { label: "النوع", value: "USB-C إلى USB-C" },
      { label: "الطول", value: "2 متر" },
      { label: "القدرة", value: "حتى 100W" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["كابل 2 متر", "رباط تنظيم"],
    compatibility: ["جميع الأجهزة ذات منفذ USB-C", "شواحن PD حتى 100W"],
    color: "أسود",
    material: "نايلون مضفّر",
    weightKg: 0.09,
    dimensions: "200 × 1.2 × 0.6 سم",
    rating: 4.6,
    reviewsCount: 47,
    salesCount: 126,
    stock: 90,
    createdAt: "2026-08-22",
  }),
  makeProduct({
    id: "p-016",
    slug: "lightning-cable-2m",
    name: "كابل Lightning بطول 2 متر",
    sku: "AK-CBL-016",
    category: "charging",
    price: 209,
    shortDescription: "كابل Lightning طويل MFi للركاب الخلفيين.",
    description:
      "كابل Lightning بطول 2 متر معتمد MFi يمتد بسهولة إلى المقاعد الخلفية، يدعم الشحن السريع 20W مع تقوية عند الطرفين.",
    features: [
      "طول 2 متر للركاب الخلفيين",
      "معتمد MFi رسميًا",
      "شحن سريع 20W",
      "تقوية مضاعفة عند الطرفين",
    ],
    usage: [
      "وصّل الطرف بالشاحن والطرف الآخر بالهاتف.",
      "استخدم الرباط لضبط الطول الزائد.",
      "تجنّب مدّ الكابل فوق حواف حادة.",
    ],
    specs: [
      { label: "التصنيف", value: "كابلات" },
      { label: "النوع", value: "USB-C إلى Lightning" },
      { label: "الطول", value: "2 متر" },
      { label: "القدرة", value: "حتى 20W" },
      { label: "اللون", value: "أبيض" },
    ],
    packageIncludes: ["كابل 2 متر", "رباط تنظيم"],
    compatibility: ["iPhone 5 وما فوق", "AirPods", "شواحن USB-C 20W+"],
    color: "أبيض",
    material: "نايلون + TPE",
    weightKg: 0.09,
    dimensions: "200 × 1.2 × 0.6 سم",
    rating: 4.5,
    reviewsCount: 33,
    salesCount: 91,
    stock: 0,
    createdAt: "2026-08-25",
  }),
  makeProduct({
    id: "p-017",
    slug: "usb-hub-splitter",
    name: "محول USB متعدد المنافذ",
    sku: "AK-CHG-017",
    category: "charging",
    price: 279,
    shortDescription: "محول 4 منافذ USB لشحن عدة أجهزة من منفذ واحد.",
    description:
      "محول USB يحوّل منفذ السيارة الواحد إلى 4 منافذ لشحن الهاتف والساعة والباوربانك معًا، مع فصل التيار وحماية كاملة لكل منفذ.",
    features: [
      "4 منافذ USB بتيار حتى 2.4A",
      "فصل تيار لكل منفذ لحماية الأجهزة",
      "مؤشر LED لكل منفذ",
      "كابل 80 سم مريح",
    ],
    usage: [
      "أدخل المحول في مقبس الـ 12V.",
      "وصّل الأجهزة في المنافذ الأربع.",
      "لا تتجاوز تيار الدائرة المذكور في الكتيب.",
    ],
    specs: [
      { label: "التصنيف", value: "شحن" },
      { label: "المنافذ", value: "4 × USB-A" },
      { label: "التيار", value: "حتى 2.4A للمنفذ" },
      { label: "طول السلك", value: "80 سم" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["محول USB الرباعي"],
    compatibility: ["سيارات 12V و 24V", "جميع الأجهزة ذات منفذ USB"],
    color: "أسود",
    material: "ABS",
    weightKg: 0.11,
    dimensions: "9 × 4 × 2 سم",
    rating: 4.2,
    reviewsCount: 26,
    salesCount: 67,
    stock: 3,
    createdAt: "2026-09-05",
  }),
  makeProduct({
    id: "p-018",
    slug: "air-freshener-refill",
    name: "تعبئة معطر السيارة",
    sku: "AK-CAR-018",
    category: "care",
    price: 59,
    shortDescription: "تعبئة احتياطية 10 مل بنفس رائحة المعطر الأساسي.",
    description:
      "تعبئة احتياطية لمعطر السيارة بسعة 10 مل ورائحة خشب الصندل نفسها، تكفي حتى 30 يومًا إضافية حسب درجة الحرارة والتهوية.",
    features: [
      "سعة 10 مل",
      "نفس تركيبة المعطر الأساسي",
      "فتحة سهلة التعبئة",
      "تغليف محكم يحافظ على الرائحة",
    ],
    usage: [
      "افتح غطاء المعطر الأساسي بحذر.",
      "أضف التعبئة ببطء حتى مستوى الإشارة.",
      "أغلق الغطاء ورجّع المعطر بلطف.",
    ],
    specs: [
      { label: "التصنيف", value: "عناية وتعطير" },
      { label: "السعة", value: "10 مل" },
      { label: "الرائحة", value: "خشب صندل" },
      { label: "اللون", value: "أصفر شفاف" },
      { label: "الاستخدام", value: "تعبئة" },
    ],
    packageIncludes: ["عبوة تعبئة 10 مل"],
    compatibility: ["معطر AutoKit المعلّق", "معظم المعطرات بفتحة علوية"],
    color: "شفاف",
    material: "زجاج",
    weightKg: 0.07,
    dimensions: "7 × 3 × 3 سم",
    rating: 4.5,
    reviewsCount: 62,
    salesCount: 341,
    stock: 300,
    createdAt: "2026-06-20",
  }),
  makeProduct({
    id: "p-019",
    slug: "microfiber-cloth",
    name: "قطعة ميكروفايبر",
    sku: "AK-CAR-019",
    category: "care",
    price: 69,
    shortDescription: "3 قطع ميكروفايبر لطيفة للزجاج واللوحة القيادة.",
    description:
      "طقم 3 قطع ميكروفايبر عالية الكثافة يمتص الماء ويترك الأسطح لامعة بدون خدوش أو بقع، مناسب للزجاج والشاشة واللوحة القيادة.",
    features: [
      "3 قطع بأحجام مختلفة",
      "خيوط دقيقة لا تخدش",
      "قابلة للغسل حتى 100 مرة",
      "تحمّل المنظفات بدون إتلاف",
    ],
    usage: [
      "استخدم القطعة رطبة للمسح الجاف لاحقًا.",
      "اغسلها بماء فاتر بدون منعم قوي.",
      "تجنّب استخدامها على سطح مليء بالرمل مباشرة.",
    ],
    specs: [
      { label: "التصنيف", value: "أدوات تنظيف" },
      { label: "الكمية", value: "3 قطع" },
      { label: "المقاسات", value: "30×30 و 40×40 سم" },
      { label: "الوزن", value: "300 جم/م²" },
      { label: "اللون", value: "رمادي / أزرق" },
    ],
    packageIncludes: ["3 قطع ميكروفايبر"],
    compatibility: ["الزجاج والمرايا", "البلاستيك والقماش", "الشاشة اللمسية"],
    color: "رمادي / أزرق",
    material: "ميكروفايبر 300gsm",
    weightKg: 0.14,
    dimensions: "40 × 40 سم (للقطعة الكبيرة)",
    rating: 4.7,
    reviewsCount: 85,
    salesCount: 276,
    stock: 240,
    createdAt: "2026-06-28",
  }),
  makeProduct({
    id: "p-020",
    slug: "interior-cleaner-spray",
    name: "بخاخ تنظيف الفرش الداخلي",
    sku: "AK-CAR-020",
    category: "care",
    price: 179,
    shortDescription: "بخاخ 500 مل لتنظيف البلاستيك والقماش بدون رائحة قوية.",
    description:
      "منظف داخلي متعدد الاستخدامات يزيل الأوساخ والبقع الدهنية من البلاستيك والقماش والمطاط، بتركيبة رغوية لطيفة لا تمسخ الألوان ولا تترك أثرًا لامعًا.",
    features: [
      "سعة 500 مل تكفي لعدات تنظيف",
      "مناسب لبلاستيك وقماش ومطاط",
      "يترك سطحًا مطفيًا بدون لمعان",
      "رغوة سهلة المسح",
    ],
    usage: [
      "رجّع العبوة جيدًا قبل الاستخدام.",
      "رشّ على المنطقة من مسافة 20 سم.",
      "اترك 30 ثانية ثم امسح بقطعة ميكروفايبر.",
    ],
    specs: [
      { label: "التصنيف", value: "منظفات" },
      { label: "السعة", value: "500 مل" },
      { label: "الشكل", value: "رغوة" },
      { label: "الرائحة", value: "خفيفة" },
      { label: "اللون", value: "عبوة بيضاء" },
    ],
    packageIncludes: ["عبوة بخاخ 500 مل", "فوطة ميكروفايبر صغيرة"],
    compatibility: ["بلاستيك لوحة القيادة", "مقاعد قماشية", "أطراف مطاطية"],
    color: "أبيض",
    material: "PVC عبوة + ماء/سطح نشط",
    weightKg: 0.55,
    dimensions: "25 × 7 × 5 سم",
    rating: 4.4,
    reviewsCount: 39,
    salesCount: 118,
    stock: 45,
    createdAt: "2026-07-05",
  }),
  makeProduct({
    id: "p-021",
    slug: "rear-window-sun-shade",
    name: "ستارة شمس زجاج خلفي",
    sku: "AK-CAR-021",
    category: "care",
    price: 169,
    shortDescription: "ستارة مغناطيسية للزجاج الخلفي تحمي الأطفال من الشمس.",
    description:
      "ستارة شمس للزجاج الخلفي تركّب بسرعة على إطار الزجاج وتقلل الحرارة داخل المقصورة الخلفية، مفيدة جدًا لراحة الأطفال في المقاعد الخلفية أثناء القيادة النهارية.",
    features: [
      "تغطي الزجاج الخلفي بالكامل",
      "تركيب مغناطيسي في ثوانٍ",
      "تُزال دون أثر على الزجاج",
      "خفيفة وتُطوى بسهولة",
    ],
    usage: [
      "قرّبها من إطار الزجاج فستلتصق النقاط المغناطيسية.",
      "تأكد من تغطية كامل المساحة.",
      "اطوِها في الكيس المرفق عند عدم الاستخدام.",
    ],
    specs: [
      { label: "التصنيف", value: "حماية وراحة" },
      { label: "المقاس", value: "110 × 50 سم" },
      { label: "التركيب", value: "نقاط مغناطيسية" },
      { label: "الحماية", value: "UV40+" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["ستارة خلفية", "كيس تخزين"],
    compatibility: ["الزجاج الخلفي لمعظم السيدان و SUV"],
    color: "أسود",
    material: "قماش عاكس + مغناطيس",
    weightKg: 0.3,
    dimensions: "110 × 50 × 1 سم",
    rating: 4.6,
    reviewsCount: 34,
    salesCount: 79,
    stock: 66,
    createdAt: "2026-07-26",
  }),
  makeProduct({
    id: "p-022",
    slug: "seat-gap-organizer",
    name: "منظّم فراغات المقاعد",
    sku: "AK-ORG-022",
    category: "travel",
    price: 159,
    shortDescription: "2 قطع تحجز الفراغ بين المقعد والكونسول وتمنع سقوط الأغراض.",
    description:
      "منظّمان ينزلان في الفراغ بين المقعد والكونسول ليسقطا المفاتيح والهاتف والعملات إلى الأرض، مع جيب للهاتف وفتحة كابل شحن.",
    features: [
      "قطعتان (يمين ويسار)",
      "يمنعان سقوط المفاتيح والهاتف",
      "جيب لحفظ الهاتف",
      "فتحة كابل شحن أمامية",
    ],
    usage: [
      "أنزل المقعد للخلف قليلًا.",
      "أدخل القطعة في الفراغ حتى تستقر.",
      "أعد ضبط المقعد ومرّر كابل الشحن.",
    ],
    specs: [
      { label: "التصنيف", value: "تنظيم السيارة" },
      { label: "الكمية", value: "قطعتان" },
      { label: "الطول", value: "28 سم" },
      { label: "اللون", value: "أسود" },
      { label: "المادة", value: "جلد صناعي + إسفنج" },
    ],
    packageIncludes: ["منظّمان للفراغين", "قماش تنظيف"],
    compatibility: ["معظم سيارات الركاب", "مقاعد جلدية وقماشية"],
    color: "أسود",
    material: "PU + إسفنج",
    weightKg: 0.19,
    dimensions: "28 × 9 × 5 سم (للقطعة)",
    rating: 4.5,
    reviewsCount: 44,
    salesCount: 134,
    stock: 80,
    createdAt: "2026-08-14",
  }),
  makeProduct({
    id: "p-023",
    slug: "first-aid-kit",
    name: "حقيبة إسعافات أولية",
    sku: "AK-TRV-023",
    category: "travel",
    price: 399,
    oldPrice: 449,
    shortDescription: "حقيبة إسعاف 45 قطعة للاستخدام الطارئ داخل السيارة.",
    description:
      "حقيبة إسعافات أولية متكاملة بـ45 قطعة تشمل ضمادات ومطهرات ولاصق جروح وأدوات أساسية، داخل حقيبة منظمة مقاومة للماء تُحفظ بسهولة داخل الصندوق.",
    features: [
      "45 قطعة أساسية",
      "حقيبة منظمة بأقسام مرنة",
      "مقاومة للماء والغبار",
      "دليل استخدام مصوّر بالعربية",
    ],
    usage: [
      "احفظ الحقيبة في مكان م accessible داخل الصندوق.",
      "راجع تواريخ الصلاحية كل 6 أشهر.",
      "لا تستخدم المستلزمات لأي حالة طبية خطيرة دون استشارة طبيب.",
    ],
    specs: [
      { label: "التصنيف", value: "سلامة الطريق" },
      { label: "عدد القطع", value: "45 قطعة" },
      { label: "المقاس", value: "24 × 18 × 8 سم" },
      { label: "المادة", value: "قماش 600D مقاوم للماء" },
      { label: "اللون", value: "أسود / أحمر" },
    ],
    packageIncludes: [
      "حقيبة الإسعاف",
      "ضمادات ومطهرات ولاصق جروح",
      "ملقط ومنشفة طبية",
      "دليل استخدام مصوّر",
    ],
    compatibility: ["جميع السيارات", "الرحلات الطويلة والتخييم"],
    color: "أسود / أحمر",
    material: "قماش 600D",
    weightKg: 0.62,
    dimensions: "24 × 18 × 8 سم",
    rating: 4.8,
    reviewsCount: 29,
    salesCount: 61,
    stock: 22,
    badge: "للطريق",
    createdAt: "2026-09-12",
  }),
  makeProduct({
    id: "p-024",
    slug: "tire-gauge",
    name: "قياس ضغط الإطارات",
    sku: "AK-TIR-024",
    category: "travel",
    price: 199,
    shortDescription: "عداد رقمي مدمج مع شاشة إضاءة ودقة ±0.5 PSI.",
    description:
      "عداد رقمي مدمج لقياس ضغط الإطارات بسرعة مع شاشة إضاءة ووحدات PSI/BAR/KPA، بحجم صغير يُحفظ في الدرج ويستبدل بطارية واحدة تدوم طويلًا.",
    features: [
      "شاشة LCD بإضاءة خلفية",
      "وحدات PSI / BAR / KPA",
      "دقة ±0.5 PSI",
      "يُطفئ تلقائيًا بعد 60 ثانية",
    ],
    usage: [
      "افتح غطاء خزانة الإطار.",
      "اضغط العداد على الحنفية بإحكام واقرأ الرقم خلال 15 ثانية.",
      "أغلق غطاء الخزانة جيدًا بعد القياس.",
    ],
    specs: [
      { label: "التصنيف", value: "أدوات الطريق" },
      { label: "الوحدات", value: "PSI / BAR / KPA" },
      { label: "المدى", value: "0 – 150 PSI" },
      { label: "البطارية", value: "CR2032 (مرفقة)" },
      { label: "اللون", value: "أسود" },
    ],
    packageIncludes: ["عداد الضغط", "بطارية CR2032", "علبة حفظ"],
    compatibility: ["سيارات ودراجات ودراجات هوائية"],
    color: "أسود",
    material: "ABS + معدن",
    weightKg: 0.08,
    dimensions: "11 × 5 × 3 سم",
    rating: 4.4,
    reviewsCount: 31,
    salesCount: 82,
    stock: 58,
    createdAt: "2026-09-18",
  }),
];

/* ------------------------------------------------------------------ */
/* دوال الاستعلام                                                      */
/* ------------------------------------------------------------------ */

export const priceRanges = [
  { key: "0-150", min: 0, max: 150, label: "أقل من 150 ج.م" },
  { key: "150-300", min: 150, max: 300, label: "150 – 300 ج.م" },
  { key: "300-500", min: 300, max: 500, label: "300 – 500 ج.م" },
  { key: "500-100000", min: 500, max: 100000, label: "أكثر من 500 ج.م" },
] as const;

export const sortOptions = [
  { key: "popular", label: "الأكثر مبيعًا" },
  { key: "newest", label: "الأحدث" },
  { key: "price-asc", label: "السعر: من الأقل" },
  { key: "price-desc", label: "السعر: من الأعلى" },
  { key: "rating", label: "الأعلى تقييمًا" },
] as const;

export type SortKey = (typeof sortOptions)[number]["key"];

export function getProductBySlug(slug: string, source: Product[] = products): Product | undefined {
  return source.find((p) => p.slug === slug);
}

/** المنتجات المنشورة فقط (تستبعد المسودات والأرشيف) */
export function getActiveProducts(source: Product[] = products): Product[] {
  return source.filter((p) => p.status === "active");
}

/** المنتجات الأكثر مبيعًا */
export function getBestSellers(limit = 4, source: Product[] = products): Product[] {
  return [...getActiveProducts(source)].sort((a, b) => b.salesCount - a.salesCount).slice(0, limit);
}

/** الأحدث إضافةًا */
export function getNewestProducts(limit = 4, source: Product[] = products): Product[] {
  return [...getActiveProducts(source)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export interface ProductQuery {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
}

/** بحث + تصفية (قسم / سعر) + ترتيب — يُستخدم لعرض قائمة المنتجات كاملة */
export function searchProducts(params: ProductQuery, source: Product[] = products): Product[] {
  const q = (params.q ?? "").trim().toLowerCase();
  let list = getActiveProducts(source);

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q)),
    );
  }

  if (params.category && params.category !== "all") {
    list = list.filter((p) => p.category === params.category);
  }

  if (params.price && params.price !== "all") {
    const range = priceRanges.find((r) => r.key === params.price);
    if (range) list = list.filter((p) => p.price >= range.min && p.price < range.max);
  }

  switch (params.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
      break;
    case "popular":
    default:
      list.sort((a, b) => b.salesCount - a.salesCount);
      break;
  }

  return list;
}

/** تقسيم الصفحات — 12 منتجًا في الصفحة */
export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** منتجات مشابهة (نفس القسم) */
export function getRelated(product: Product, limit = 4, source: Product[] = products): Product[] {
  return getActiveProducts(source)
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, limit);
}
