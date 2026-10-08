import Link from "next/link";
import AddBundleToCartButton from "@/components/products/AddBundleToCartButton";
import ProductImage from "@/components/products/ProductImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { products as allProducts } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import type { Bundle } from "@/lib/types";

export default function BundlesSection({ bundles }: { bundles: Bundle[] }) {
  return (
    <section id="bundles" aria-labelledby="bundles-title" className="container-x section-y scroll-mt-24">
      <SectionHeading
        eyebrow="وفّر أكثر"
        title="الباقات"
        description="باقات جاهزة تجمع أكثر المنتجات استخدامًا بسعر أوفر من شرائها منفصلة. الأسعار تجريبية."
      />

      <ul id="bundles-title" className="grid gap-5 md:grid-cols-3">
        {bundles.map((bundle) => {
          const included = bundle.productSlugs
            .map((slug) => allProducts.find((p) => p.slug === slug))
            .filter(Boolean) as (typeof allProducts)[number][];
          const saving = bundle.originalPrice - bundle.price;

          return (
            <li key={bundle.id} className="card card-hover flex flex-col overflow-hidden">
              <div className="relative">
                <ProductImage src={bundle.image} alt={`صورة ${bundle.name}`} ratio="16:9" sizes="(max-width: 768px) 100vw, 33vw" />
                {bundle.badge && (
                  <span className="absolute start-3 top-3 rounded-md bg-brand-500 px-2 py-1 text-[0.7rem] font-bold text-white">
                    {bundle.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="text-lg font-extrabold text-ink-950">{bundle.name}</h3>
                  <p className="mt-1 text-[0.82rem] font-semibold text-brand-600">{bundle.tagline}</p>
                </div>

                <p className="text-[0.85rem] leading-7 text-ink-500">{bundle.description}</p>

                <div className="rounded-lg bg-ink-50 p-3">
                  <p className="mb-2 text-[0.75rem] font-extrabold text-ink-700">محتويات الباقة:</p>
                  <ul className="space-y-1.5">
                    {included.map((p) => (
                      <li key={p.slug} className="flex items-center justify-between gap-2 text-[0.8rem]">
                        <Link href={`/products/${p.slug}`} className="font-semibold text-ink-800 hover:text-brand-600">
                          {p.name}
                        </Link>
                        <span className="shrink-0 text-ink-400">{formatPrice(p.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                  <div>
                    <span className="block text-lg font-extrabold text-ink-950">{formatPrice(bundle.price)}</span>
                    <span className="text-xs text-ink-400 line-through">{formatPrice(bundle.originalPrice)}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">توفير {formatPrice(saving)}</span>
                </div>

                <AddBundleToCartButton productSlugs={bundle.productSlugs} fullWidth />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
