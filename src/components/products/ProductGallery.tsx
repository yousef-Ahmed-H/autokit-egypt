"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * معرض صور المنتج: صور مصغّرة + صورة رئيسية + تكبير.
 * الصور حاليًا Placeholders محلية؛ عند رفع صور حقيقية
 * يكفي تحديث حقل `images` في بيانات المنتج.
 */
export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const current = images[active] ?? images[0];

  return (
    <div>
      {/* الصورة الرئيسية */}
      <div className="relative overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setZoomOpen(true);
          }}
          className="block w-full cursor-zoom-in"
          aria-label="تكبير الصورة"
        >
          <Image
            src={current}
            alt={`${alt} — صورة ${active + 1}`}
            width={800}
            height={600}
            priority
            className="h-auto w-full object-contain"
          />
        </button>
        <span className="absolute bottom-3 end-3 rounded-md bg-ink-950/75 px-2 py-1 text-[0.7rem] font-bold text-white">
          اضغط للتكبير
        </span>
      </div>

      {/* الصور المصغّرة */}
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2" aria-label="صور المنتج">
          {images.map((img, index) => (
            <li key={img}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`عرض الصورة ${index + 1}`}
                aria-current={index === active}
                className={`block w-full overflow-hidden rounded-lg border bg-ink-50 transition-colors ${
                  index === active ? "border-brand-500" : "border-ink-100 hover:border-ink-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${alt} — مصغّرة ${index + 1}`}
                  width={200}
                  height={150}
                  className="h-auto w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* نافذة التكبير */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`تكبير صورة ${alt}`}
          className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/25 text-lg font-bold text-white hover:bg-white/10"
                aria-label="تصغير"
              >
                −
              </button>
              <span className="grid h-9 min-w-14 place-items-center rounded-lg border border-white/10 px-2 text-sm font-bold text-white">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
                aria-label="تكبير"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/25 text-white"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="rounded-lg border border-white/25 px-3 py-2 text-sm font-bold text-white"
            >
              إغلاق ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto rounded-lg bg-white/5 p-2">
            <div
              className="mx-auto transition-transform duration-150"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center top", width: "100%" }}
            >
              <Image
                src={current}
                alt={`${alt} — صورة مكبّرة`}
                width={1200}
                height={900}
                className="mx-auto h-auto w-full max-w-3xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}