import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BundlesSection from "@/components/home/BundlesSection";
import WhyUs from "@/components/home/WhyUs";
import OrderSteps from "@/components/home/OrderSteps";
import ReviewsSection from "@/components/home/ReviewsSection";
import FaqSection from "@/components/home/FaqSection";
import { listBundles, listCategories, listProducts } from "@/lib/db/queries";
import { faqGroups } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "أوتوكيت مصر — إكسسوارات سيارات: حوامل، شواحن، عناية وتنظيم",
};

export default async function HomePage() {
  const [categories, featured, bundles] = await Promise.all([
    listCategories(),
    listProducts({ sort: "rating" }),
    listBundles(),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured.slice(0, 4)} />
      <BundlesSection bundles={bundles} />
      <WhyUs />
      <OrderSteps />
      <ReviewsSection />
      <FaqSection groups={faqGroups} limit={2} />
    </>
  );
}
