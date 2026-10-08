"use client";

import { useFavorites } from "@/components/favorites/favorites-context";

/** زر المفضلة (اختياري) — قلب يظهر فوق صور المنتجات وفي صفحة المنتج */
export default function FavoriteButton({
  slug,
  variant = "icon",
}: {
  slug: string;
  variant?: "icon" | "full";
}) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const active = hydrated && isFavorite(slug);
  const label = active ? "إزالة من المفضلة" : "أضف إلى المفضلة";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={active}
        className={`btn ${active ? "btn-dark" : "btn-outline"}`}
      >
        <span aria-hidden>{active ? "♥" : "♡"}</span>
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border bg-white/95 text-lg leading-none shadow-sm transition-colors ${
        active ? "border-brand-500 text-brand-500" : "border-ink-200 text-ink-400 hover:text-brand-500"
      }`}
    >
      <span aria-hidden>{active ? "♥" : "♡"}</span>
    </button>
  );
}