import Image from "next/image";
import Link from "next/link";
import { CheckIcon, ShieldIcon, TruckIcon, WalletIcon } from "@/components/ui/icons";

const highlights = [
  { icon: TruckIcon, text: "شحن لكل محافظات مصر" },
  { icon: WalletIcon, text: "الدفع عند الاستلام" },
  { icon: ShieldIcon, text: "استبدال خلال 14 يومًا" },
];

/** البانر الرئيسي (بانر واحد كما هو مطلوب) */
export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-ink-950">
      <Image
        src="/placeholders/banner-hero.svg"
        alt="بانر ترويجي تجريبي — AutoKit Egypt"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/60 to-ink-950/90" />

      <div className="container-x relative py-14 md:py-20">
        <div className="max-w-2xl">
          <span className="demo-tag">منتجات وهمية للعرض — Demo</span>

          <h1
            id="hero-title"
            className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl"
          >
            خلّي عربيتك <span className="text-brand-400">أريح</span> وأنظم
            <span className="block">وأكثر أمانًا</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-ink-200 sm:text-base">
            إكسسوارات عملية لسيارتك: حوامل موبايل، شواحن وكابلات، عناية بالمقصورة وتنظيم للصندوق —
            تجهيزات تسوّقها بخطوات بسيطة من الموبايل.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary">
              تسوق الآن
            </Link>
            <Link href="/#bundles" className="btn btn-ghost-light">
              شاهد الباقات
            </Link>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[0.82rem] font-semibold text-ink-100"
              >
                <span className="text-brand-400">
                  <Icon width={18} height={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-300">
            <CheckIcon width={14} height={14} className="text-brand-400" />
            الأسعار والمخزون المعروضة تجريبية لأغراض العرض فقط.
          </p>
        </div>
      </div>
    </section>
  );
}
