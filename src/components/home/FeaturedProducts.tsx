import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Product } from "@/lib/types";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="featured-title" className="bg-ink-50">
      <div className="container-x section-y">
        <SectionHeading
          eyebrow="اختيارات العملاء"
          title="المنتجات الأكثر مبيعًا"
          description="ترتيب تجريبي مبني على تقييمات وهمية — يُستبدل ببيانات المبيعات الفعلية عند ربط قاعدة البيانات."
          action={
            <Link href="/products" className="btn btn-outline">
              عرض الكل
            </Link>
          }
        />

        <ul id="featured-title" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
