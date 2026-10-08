import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductImage from "@/components/products/ProductImage";
import type { Category } from "@/lib/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="container-x section-y">
      <SectionHeading
        eyebrow="تسوّق حسب القسم"
        title="الأقسام"
        description="اختار القسم المناسب لسيارتك وابدأ التسوّق."
        action={
          <Link href="/products" className="btn btn-outline">
            كل المنتجات
          </Link>
        }
      />

      <ul id="categories-title" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/products?category=${cat.slug}`}
              className="card card-hover group flex h-full flex-col overflow-hidden"
            >
              <ProductImage src={cat.image} alt={`قسم ${cat.name}`} ratio="4:3" sizes="(max-width: 640px) 50vw, 25vw" />
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="text-[0.95rem] font-extrabold text-ink-950 group-hover:text-brand-600">
                  {cat.name}
                </h3>
                <p className="line-clamp-2 text-[0.78rem] leading-6 text-ink-500">{cat.description}</p>
                <span className="mt-auto pt-2 text-[0.78rem] font-bold text-brand-600">تسوّق الآن ←</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
