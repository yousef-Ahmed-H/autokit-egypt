import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import type { FaqGroup } from "@/lib/types";

/**
 * الأسئلة الشائعة — أكورديون بأصل <details> بدون أي مكتبات JS.
 */
export default function FaqSection({
  groups,
  limit,
  showAllLink = true,
}: {
  groups: FaqGroup[];
  limit?: number;
  showAllLink?: boolean;
}) {
  const visibleGroups = typeof limit === "number" ? groups.slice(0, limit) : groups;
  const itemCount = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section aria-labelledby="faq-title" className="container-x section-y scroll-mt-24">
      <SectionHeading
        eyebrow="المساعدة"
        title="الأسئلة الشائعة"
        description={`${itemCount} سؤالًا شائعًا عن الشحن والدفع والطلبات.`}
        action={
          showAllLink ? (
            <Link href="/faq" className="btn btn-outline">
              كل الأسئلة
            </Link>
          ) : undefined
        }
      />

      <div id="faq-title" className="grid gap-6 lg:grid-cols-2">
        {visibleGroups.map((group) => (
          <div key={group.id} id={group.id} className="scroll-mt-28">
            <h3 className="mb-3 text-base font-extrabold text-ink-950">{group.title}</h3>
            <div className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100 bg-white">
              {group.items.map((item) => (
                <details key={item.question} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.92rem] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span className="shrink-0 text-brand-500 transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-3 text-[0.86rem] leading-7 text-ink-500">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
