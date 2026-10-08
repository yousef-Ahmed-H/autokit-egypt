"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

/** إدخال كود الخصم (كوبونات تجريبية فقط) */
export default function CouponForm() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = applyCoupon(code);
    if (result.ok) {
      setMessage({ kind: "ok", text: result.message ?? "تم تطبيق الكود" });
      setCode("");
    } else {
      setMessage({ kind: "error", text: result.message ?? "كود غير صحيح" });
    }
  }

  return (
    <div className="mt-4 border-t border-ink-100 pt-4">
      <h3 className="text-xs font-extrabold text-ink-700">كود الخصم (تجريبي)</h3>

      {coupon ? (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2">
          <span className="text-xs font-bold text-emerald-700">
            {coupon.code} — {coupon.description}
          </span>
          <button
            type="button"
            onClick={() => {
              removeCoupon();
              setMessage(null);
            }}
            className="text-xs font-bold text-emerald-700 underline"
          >
            إزالة
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-2 flex gap-2">
          <label htmlFor="coupon" className="sr-only">
            كود الخصم
          </label>
          <input
            id="coupon"
            name="coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AUTO10"
            className="field flex-1 uppercase"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-dark px-4 py-2 text-sm">
            تطبيق
          </button>
        </form>
      )}

      {message && (
        <p
          role="status"
          className={`mt-2 text-[0.72rem] font-semibold ${
            message.kind === "ok" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="mt-2 text-[0.68rem] leading-5 text-ink-400">
        أكواد تجريبية: AUTO10 (10%) — ROAD50 (50 ج.م فوق 300) — FREESHIP (شحن مجاني)
      </p>
    </div>
  );
}