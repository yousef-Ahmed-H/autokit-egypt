"use client";

import { useState } from "react";

/** منتقي الكمية في صفحة المنتج */
export default function QuantitySelector({
  initial = 1,
  max = 99,
  onChange,
}: {
  initial?: number;
  max?: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState(initial);

  function update(next: number) {
    const clamped = Math.min(max, Math.max(1, next));
    setValue(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-ink-200">
      <button
        type="button"
        onClick={() => update(value - 1)}
        className="h-10 w-10 text-lg font-bold text-ink-600 hover:bg-ink-50"
        aria-label="إنقاص الكمية"
      >
        −
      </button>
      <span aria-live="polite" className="w-10 text-center text-sm font-extrabold">
        {value}
      </span>
      <button
        type="button"
        onClick={() => update(value + 1)}
        className="h-10 w-10 text-lg font-bold text-ink-600 hover:bg-ink-50"
        aria-label="زيادة الكمية"
      >
        +
      </button>
      <span className="sr-only">الكمية</span>
    </div>
  );
}
