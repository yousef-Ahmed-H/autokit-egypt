"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import AddToCartButton from "@/components/products/AddToCartButton";
import QuantitySelector from "@/components/products/QuantitySelector";
import { WhatsAppIcon } from "@/components/ui/icons";
import { MAX_QTY_PER_ITEM } from "@/lib/orders/rules";
import { whatsappLink } from "@/lib/site";

/** منطقة الشراء: الكمية + إضافة للسلة + شراء الآن + واتساب */
export default function ProductPurchase({
  slug,
  name,
  stock,
  sku,
}: {
  slug: string;
  name: string;
  stock: number;
  sku: string;
}) {
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const soldOut = stock <= 0;
  const max = Math.max(1, Math.min(stock, MAX_QTY_PER_ITEM));

  function buyNow() {
    const result = add(slug, qty);
    if (!result.ok) {
      setMessage(result.message ?? "تعذّر إتمام العملية");
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector
          initial={1}
          max={max}
          onChange={(value) => {
            setQty(value);
            setMessage(null);
          }}
        />
        <span className="text-xs font-semibold text-ink-500">
          {soldOut ? "غير متوفر حاليًا" : `متوفر: ${stock} قطعة (مخزون تجريبي)`}
        </span>
      </div>

      {message && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700" role="status">
          {message}
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {soldOut ? (
          <button type="button" className="btn btn-outline w-full sm:col-span-2" disabled>
            نفد المخزون
          </button>
        ) : (
          <>
            <AddToCartButton slug={slug} qty={qty} label={`أضف ${qty} إلى السلة`} fullWidth />
            <button type="button" onClick={buyNow} className="btn btn-dark w-full">
              شراء الآن
            </button>
          </>
        )}
      </div>

      <a
        href={whatsappLink(`مرحبًا، أريد الاستفسار عن: ${name} (كود ${sku}).`)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn mt-2 w-full bg-[#25D366] text-white hover:brightness-95"
      >
        <WhatsAppIcon width={18} height={18} /> اسأل عن المنتج على واتساب
      </a>

      <ul className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-[0.8rem] text-ink-500">
        <li>🚚 شحن لكل المحافظات (يُحسب عند إتمام الطلب)</li>
        <li>💵 الدفع عند الاستلام فقط</li>
        <li>↩️ استبدال خلال 14 يومًا وفق الشروط</li>
      </ul>
    </div>
  );
}