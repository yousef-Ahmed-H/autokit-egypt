import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/db/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://autokit-egypt.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const staticPaths = [
    "",
    "/products",
    "/about",
    "/contact",
    "/faq",
    "/cart",
    "/checkout",
    "/track",
    "/policies",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
    "/returns",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    priority: p === "" ? 1.0 : p.startsWith("/products") ? 0.9 : 0.7,
  }));

  const productPaths = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(),
    priority: 0.9,
  }));

  return [...staticPaths, ...productPaths];
}