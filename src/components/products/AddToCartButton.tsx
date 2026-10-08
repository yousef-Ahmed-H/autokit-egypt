"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { CheckIcon } from "@/components/ui/icons";

type Notice = { kind: "error" | "info"; text: string } | null;

export default function AddToCartButton({
  slug,
  label = "أضف إلى السلة",
  qty = 1,
  fullWidth = false,
  disabled = false,
}: {
  slug: string;
  label?: string;
  qty?: number;
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function flash(fn: () => void) {
    if (timer.current) window.clearTimeout(timer.current);
    fn();
  }

  function handleClick() {
    const result = add(slug, qty);

    if (!result.ok) {
      // فشل (نفد المخزون أو ضغط متكرر) — لا نضيف
      flash(() => {
        setNotice({ kind: "error", text: result.message ?? "تعذّرت الإضافة" });
        window.setTimeout(() => setNotice(null), 2500);
      });
      return;
    }

    if (result.message) {
      setNotice({ kind: "info", text: result.message });
      window.setTimeout(() => setNotice(null), 2500);
    } else {
      setNotice(null);
    }

    flash(() => setAdded(true));
    timer.current = window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={fullWidth ? "w-full" : "inline-block"}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`btn ${added ? "btn-dark" : "btn-primary"} ${fullWidth ? "w-full" : ""}`}
        aria-live="polite"
      >
        {added ? (
          <>
            <CheckIcon width={18} height={18} /> تمت الإضافة
          </>
        ) : (
          label
        )}
      </button>

      {notice && (
        <p
          role="status"
          className={`mt-2 text-[0.75rem] font-semibold ${
            notice.kind === "error" ? "text-red-600" : "text-brand-600"
          }`}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}