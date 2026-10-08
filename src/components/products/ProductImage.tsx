"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  /** نسب العرض/الارتفاع — الافتراضي 4:3 لبطاقات المنتجات */
  ratio?: "4:3" | "1:1" | "16:9" | "3:2";
  priority?: boolean;
  sizes?: string;
  className?: string;
};

const RATIOS: Record<NonNullable<Props["ratio"]>, string> = {
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "3:2": "aspect-[3/2]",
};

/**
 * صورة المنتج/القسم.
 * حاليًا تعرض Placeholder SVG محلية داخل /public.
 * عند رفع الصور الحقيقية غيّر `image` في بيانات المنتج فقط.
 */
export default function ProductImage({
  src,
  alt,
  ratio = "4:3",
  priority = false,
  sizes = "(max-width: 640px) 100vw, 33vw",
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden bg-ink-50 ${RATIOS[ratio]} ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs font-semibold text-ink-400">
          صورة غير متاحة
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-3 transition-transform duration-200 group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
