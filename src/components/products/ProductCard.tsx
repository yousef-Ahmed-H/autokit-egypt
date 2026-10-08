import Link from "next/link";
import AddToCartButton from "@/components/products/AddToCartButton";
import FavoriteButton from "@/components/products/FavoriteButton";
import ProductImage from "@/components/products/ProductImage";
import Rating from "@/components/ui/Rating";
import { STOCK_LABEL, stockStatus } from "@/lib/data/products";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const off = product.oldPrice ? discountPercent(product.price, product.oldPrice) : 0;
  const status = stockStatus(product);
  const soldOut = status === "out_of_stock";

  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
          {product.badge && (
            <span className="rounded-md bg-ink-950 px-2 py-1 text-[0.68rem] font-bold text-white">
              {product.badge}
            </span>
          )}
          {off > 0 && (
            <span className="rounded-md bg-brand-500 px-2 py-1 text-[0.68rem] font-bold text-white">
              خصم {off}%
            </span>
          )}
        </div>

        <div className="absolute end-2 top-2">
          <FavoriteButton slug={product.slug} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.slug}`}
          className="font-extrabold text-ink-950 hover:text-brand-600"
        >
          {product.name}
        </Link>

        <p className="line-clamp-2 text-[0.82rem] leading-6 text-ink-500">{product.shortDescription}</p>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {product.verifiedStats === true && (
            <Rating rating={product.rating} reviewsCount={product.reviewsCount} />
          )}

          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-ink-950">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-ink-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <span
              className={`text-[0.7rem] font-bold ${
                soldOut
                  ? "text-red-600"
                  : status === "low_stock"
                    ? "text-amber-600"
                    : "text-emerald-600"
              }`}
            >
              {soldOut ? "نفد" : status === "low_stock" ? `باقي ${product.stock}` : "متوفر"}
            </span>
          </div>

          <AddToCartButton slug={product.slug} fullWidth disabled={soldOut} />
        </div>
      </div>
    </article>
  );
}