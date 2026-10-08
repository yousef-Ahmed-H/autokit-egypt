import { HeadsetIcon, ShieldIcon, TruckIcon, WalletIcon } from "@/components/ui/icons";
import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  {
    icon: TruckIcon,
    title: "توصيل لكل المحافظات",
    text: "نغطي كل محافظات مصر، والشحن يُحسب عند إتمام الطلب بشفافية.",
  },
  {
    icon: WalletIcon,
    title: "دفع مرن وآمن",
    text: "الدفع عند الاستلام أو المحفظة الإلكترونية (فودافون كاش / إنستاباي).",
  },
  {
    icon: ShieldIcon,
    title: "منتجات مختارة بعناية",
    text: "كل منتج يمر بمراجعة جودة قبل إضافته للمتجر، مع ضمان استبدال.",
  },
  {
    icon: HeadsetIcon,
    title: "دعم سريع على واتساب",
    text: "فريق الدعم متاح للرد على استفساراتك ومتابعة طلباتك بسرعة.",
  },
];

export default function WhyUs() {
  return (
    <section aria-labelledby="why-us-title" className="bg-ink-950 text-white">
      <div className="container-x section-y">
        <div className="mb-7">
          <p className="eyebrow mb-1.5">المزايا</p>
          <h2 id="why-us-title" className="h-section text-white">لماذا تختارنا؟</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-300">
            نبني تجربة الشراء على البساطة والوضوح: منتجات مفهومة، أسعار واضحة، وخطوات قليلة حتى يوصلك طلبك.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500 text-white">
                <Icon width={22} height={22} />
              </span>
              <h3 className="mt-4 text-[0.98rem] font-extrabold">{title}</h3>
              <p className="mt-2 text-[0.84rem] leading-7 text-ink-300">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
