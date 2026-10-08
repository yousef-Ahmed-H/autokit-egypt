"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";

/** زر نسخ رقم الطلب */
export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className="btn btn-outline px-3 py-2 text-xs">
      {copied ? "✓ تم النسخ" : "نسخ رقم الطلب"}
    </button>
  );
}

/** تفريغ السلة بعد نجاح الطلب + تصفير مفتاح منع التكرار */
export function ClearCartOnSuccess() {
  const { clear, count, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated || count === 0) return;
    clear();
    try {
      window.sessionStorage.removeItem("autokit-order-key");
    } catch {
      /* ignore */
    }
  }, [hydrated, count, clear]);

  return null;
}