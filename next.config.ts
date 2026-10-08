import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // الصور الحالية عبارة عن Placeholders SVG محلية داخل /public
    // عند رفع الصور الحقيقية يمكن حذف dangerouslyAllowSVG أو إبقاؤه للـ SVG فقط.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // احجز المكان لصور المنتجات المستقبلية (Supabase Storage مثلاً)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  typedRoutes: false,
};

export default nextConfig;
