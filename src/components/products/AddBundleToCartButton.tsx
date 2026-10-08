"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { CheckIcon } from "@/components/ui/icons";

/** إضافة كل منتجات الباقة إلى السلة دفعة واحدة */
export default function AddBundleToCartButton({
  productSlugs,
  fullWidth = false,
}: {
  productSlugs: string[];
  fullWidth?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    productSlugs.forEach((slug) => add(slug, 1));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn ${added ? "btn-dark" : "btn-primary"} ${fullWidth ? "w-full" : ""}`}
      aria-live="polite"
    >
      {added ? (
        <>
          <CheckIcon width={18} height={18} /> تمت إضافة الباقة
        </>
      ) : (
        "أضف الباقة للسلة"
      )}
    </button>
  );
}
