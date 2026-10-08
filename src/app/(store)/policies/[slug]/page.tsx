import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPolicy, type PolicySlug } from "@/lib/content/store";
import { formatPrice } from "@/lib/format";

const SLUGS: PolicySlug[] = ["shipping", "returns", "privacy", "terms"];

export async function generateStaticParams(): Promise<{ slug: PolicySlug }[]> {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: PolicySlug }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  return {
    title: policy?.title ?? "السياسات",
    description: policy?.body.slice(0, 160) ?? "سياسات المتجر",
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: PolicySlug }> }) {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) notFound();

  const body = policy.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <section className="section container max-w-[820px] space-y-5">
      <header>
        <p className="eyebrow">السياسات</p>
        <h1 className="h-section">{policy.title}</h1>
      </header>

      <article className="card space-y-4 p-6 text-ink-700 leading-7">
        {body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>

      <div className="text-xs text-ink-400">آخر تحديث: {policy.updatedAt.slice(0, 10)}</div>
    </section>
  );
}