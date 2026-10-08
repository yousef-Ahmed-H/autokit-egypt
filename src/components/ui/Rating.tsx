import { StarIcon } from "@/components/ui/icons";

export default function Rating({
  rating,
  reviewsCount,
  size = 14,
}: {
  rating: number;
  reviewsCount?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5" title={`التقييم ${rating} من 5 (بيانات تجريبية)`}>
      <span className="flex items-center gap-0.5 text-brand-500" aria-hidden>
        <StarIcon width={size} height={size} />
        <span className="text-xs font-bold text-ink-800">{rating.toFixed(1)}</span>
      </span>
      {typeof reviewsCount === "number" && (
        <span className="text-xs text-ink-400">({reviewsCount} تقييم تجريبي)</span>
      )}
      <span className="sr-only">التقييم {rating} من 5 — بيانات تجريبية</span>
    </div>
  );
}
