import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AutoKit Egypt — إكسسوارات سيارات داخل مصر",
    template: "%s | AutoKit Egypt",
  },
  description:
    "متجر إكسسوارات السيارات داخل مصر: حوامل موبايل، شواحن وكابلات، عناية وتنظيم — نسخة تجريبية ببيانات Demo.",
  applicationName: "AutoKit Egypt",
  keywords: ["إكسسوارات سيارات", "حامل موبايل", "شاحن سيارة", "كابل USB-C", "مصر"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://autokit-egypt.example"),
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-dvh bg-white text-ink-900 antialiased">{children}</body>
    </html>
  );
}