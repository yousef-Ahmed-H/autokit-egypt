import SectionHeading from "@/components/ui/SectionHeading";
import Rating from "@/components/ui/Rating";
import { DEMO_REVIEWS_LABEL, reviews } from "@/lib/data/content";

export default function ReviewsSection() {
  return (
    <section aria-labelledby="reviews-title" className="bg-ink-50">
      <div className="container-x section-y">
        <SectionHeading
          eyebrow="آراء العملاء"
          title="ماذا قال عملاؤنا؟"
          description="الآراء التالية مكتوبة لغرض عرض شكل القسم فقط، وليست تقييمات حقيقية لعملاء فعليين."
        />

        <p className="mb-5">
          <span className="demo-tag">{DEMO_REVIEWS_LABEL}</span>
        </p>

        <ul id="reviews-title" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <li key={review.id} className="card flex h-full flex-col p-5">
              <Rating rating={review.rating} />
              <blockquote className="mt-3 flex-1 text-[0.88rem] leading-7 text-ink-600">
                «{review.text}»
              </blockquote>
              <footer className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-950 text-xs font-extrabold text-white">
                  {review.author.slice(0, 1)}
                </span>
                <span>
                  <span className="block text-[0.85rem] font-extrabold text-ink-900">{review.author}</span>
                  <span className="block text-[0.72rem] text-ink-400">{review.city} — عميل تجريبي</span>
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
