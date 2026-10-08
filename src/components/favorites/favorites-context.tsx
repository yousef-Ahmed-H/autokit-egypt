"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProductBySlug } from "@/lib/data/products";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "autokit-favorites-v1";

interface FavoritesContextValue {
  slugs: string[];
  products: Product[];
  count: number;
  hydrated: boolean;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === "string")
      .filter((slug) => Boolean(getProductBySlug(slug)));
  } catch {
    return [];
  }
}

/** المفضلة (اختيارية) — تُحفظ محليًا على الجهاز */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSlugs(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      /* ignore */
    }
  }, [slugs, hydrated]);

  const isFavorite = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);
  const remove = useCallback((slug: string) => setSlugs((prev) => prev.filter((s) => s !== slug)), []);
  const clear = useCallback(() => setSlugs([]), []);

  const value = useMemo<FavoritesContextValue>(() => {
    const products = slugs
      .map((slug) => getProductBySlug(slug))
      .filter((p): p is Product => Boolean(p));
    return { slugs, products, count: slugs.length, hydrated, isFavorite, toggle, remove, clear };
  }, [slugs, hydrated, isFavorite, toggle, remove, clear]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}