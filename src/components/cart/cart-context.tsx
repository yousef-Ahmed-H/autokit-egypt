"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductBySlug } from "@/lib/data/products";
import { computeTotals, findCoupon, type Totals } from "@/lib/pricing";
import type { Coupon, Product } from "@/lib/types";

const STORAGE_KEY = "autokit-cart-v1";
const COUPON_KEY = "autokit-coupon-v1";
const MAX_QTY = 20;
/** نافذة منع الضغط المتكرر (بالمللي ثانية) */
const CLICK_LOCK_MS = 300;

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface ResolvedCartLine extends CartLine {
  product?: Product;
  lineTotal: number;
  /** أقصى كمية مسموح بها حسب المخزون */
  max: number;
  /** true إذا وصلت الكمية للحد الأقصى */
  atMax: boolean;
  /** true إذا لم يعد المنتج متاحًا */
  unavailable: boolean;
}

export interface AddResult {
  ok: boolean;
  message?: string;
}

interface CartContextValue {
  lines: CartLine[];
  resolvedLines: ResolvedCartLine[];
  count: number;
  subtotal: number;
  totals: Totals;
  coupon: Coupon | null;
  /** true بعد قراءة localStorage (يمنع اختلال الـ hydration) */
  hydrated: boolean;
  add: (slug: string, quantity?: number) => AddResult;
  setQuantity: (slug: string, quantity: number) => AddResult;
  remove: (slug: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => AddResult;
  removeCoupon: () => void;
  maxFor: (slug: string) => number;
  canAdd: (slug: string, quantity?: number) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

/** أقصى كمية مسموحة لمنتج حسب المخزون والحد العام */
function limitFor(product: Product | undefined): number {
  if (!product) return 0;
  return Math.max(0, Math.min(MAX_QTY, product.stock));
}

function clampLine(slug: string, quantity: number): CartLine | null {
  const product = getProductBySlug(slug);
  const max = limitFor(product);
  if (max <= 0) return null;
  const safe = Math.min(Math.max(1, Math.round(quantity)), max);
  return { slug, quantity: safe };
}

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed
      .filter(
        (l): l is CartLine =>
          typeof l === "object" &&
          l !== null &&
          typeof (l as CartLine).slug === "string" &&
          typeof (l as CartLine).quantity === "number",
      )
      .map((l) => clampLine(l.slug, l.quantity))
      .filter((l): l is CartLine => l !== null);

    // إزالة أي تكرار لنفس المنتج (سلة واحدة لكل منتج)
    const unique = new Map<string, CartLine>();
    for (const line of cleaned) {
      const existing = unique.get(line.slug);
      if (existing) {
        unique.set(line.slug, clampLine(line.slug, existing.quantity + line.quantity) ?? existing);
      } else {
        unique.set(line.slug, line);
      }
    }
    return [...unique.values()];
  } catch {
    return [];
  }
}

function readCoupon(): string | null {
  if (typeof window === "undefined") return null;
  const code = window.localStorage.getItem(COUPON_KEY);
  return code && findCoupon(code) ? code.toUpperCase() : null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const lastClickRef = useRef<{ slug: string; at: number } | null>(null);

  /* تحميل السلة من التخزين المحلي (تُحفظ مؤقتًا بين الزيارات) */
  useEffect(() => {
    setLines(readStorage());
    setCouponCode(readCoupon());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* التخزين ممتلئ أو محظور — يتم تجاهل الخطأ */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (couponCode) window.localStorage.setItem(COUPON_KEY, couponCode);
      else window.localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [couponCode, hydrated]);

  /** حماية من الضغط المتكرر السريع على نفس المنتج */
  const isRapidRepeat = useCallback((slug: string) => {
    const now = Date.now();
    const last = lastClickRef.current;
    if (last && last.slug === slug && now - last.at < CLICK_LOCK_MS) return true;
    lastClickRef.current = { slug, at: now };
    return false;
  }, []);

  const add = useCallback(
    (slug: string, quantity = 1): AddResult => {
      const product = getProductBySlug(slug);
      const max = limitFor(product);

      if (!product) return { ok: false, message: "المنتج غير موجود" };
      if (product.status !== "active") return { ok: false, message: "المنتج غير متاح حاليًا" };
      if (max <= 0) return { ok: false, message: "نفد المخزون" };
      if (isRapidRepeat(slug)) return { ok: false, message: "جارٍ الإضافة…" };

      let result: AddResult = { ok: true };
      setLines((prev) => {
        const existing = prev.find((l) => l.slug === slug);
        if (!existing) return [...prev, { slug, quantity: Math.min(max, Math.max(1, quantity)) }];
        const desired = existing.quantity + Math.max(1, quantity);
        if (desired > max) result = { ok: true, message: `الحد الأقصى المتاح ${max} قطعة` };
        return prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(max, desired) } : l));
      });
      return result;
    },
    [isRapidRepeat],
  );

  const setQuantity = useCallback((slug: string, quantity: number): AddResult => {
    const product = getProductBySlug(slug);
    const max = limitFor(product);
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.slug !== slug));
      return { ok: true };
    }
    if (max <= 0) {
      setLines((prev) => prev.filter((l) => l.slug !== slug));
      return { ok: false, message: "نفد المخزون — تم حذف المنتج من السلة" };
    }
    const safe = Math.min(quantity, max);
    setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, quantity: safe } : l)));
    return safe < quantity ? { ok: true, message: `الحد الأقصى المتاح ${max} قطعة` } : { ok: true };
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string): AddResult => {
      const coupon = findCoupon(code);
      if (!coupon) return { ok: false, message: "كود الخصم غير صحيح" };

      const subtotal = lines.reduce((sum, line) => {
        const product = getProductBySlug(line.slug);
        return sum + (product ? product.price * line.quantity : 0);
      }, 0);

      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        return {
          ok: false,
          message: `هذا الكود يعمل للطلبات فوق ${coupon.minSubtotal} ج.م`,
        };
      }

      setCouponCode(coupon.code);
      return { ok: true, message: `تم تطبيق ${coupon.code} — ${coupon.description}` };
    },
    [lines],
  );

  const removeCoupon = useCallback(() => setCouponCode(null), []);

  const maxFor = useCallback((slug: string) => limitFor(getProductBySlug(slug)), []);

  const canAdd = useCallback(
    (slug: string, quantity = 1) => {
      const max = limitFor(getProductBySlug(slug));
      const current = lines.find((l) => l.slug === slug)?.quantity ?? 0;
      return max > 0 && current + quantity <= max;
    },
    [lines],
  );

  const value = useMemo<CartContextValue>(() => {
    const resolvedLines: ResolvedCartLine[] = lines.map((line) => {
      const product = getProductBySlug(line.slug);
      const max = limitFor(product);
      return {
        ...line,
        product,
        lineTotal: product ? product.price * line.quantity : 0,
        max,
        atMax: line.quantity >= max,
        unavailable: !product || max <= 0,
      };
    });

    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const coupon = couponCode ? findCoupon(couponCode) ?? null : null;
    const totals = computeTotals({ subtotal, coupon });

    return {
      lines,
      resolvedLines,
      count,
      subtotal,
      totals,
      coupon,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      applyCoupon,
      removeCoupon,
      maxFor,
      canAdd,
    };
  }, [
    lines,
    couponCode,
    hydrated,
    add,
    setQuantity,
    remove,
    clear,
    applyCoupon,
    removeCoupon,
    maxFor,
    canAdd,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}