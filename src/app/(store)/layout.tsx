import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/components/cart/cart-context";
import { FavoritesProvider } from "@/components/favorites/favorites-context";

/** تخطيط واجهة المتجر (بدون لوحة التحكم) */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <CartProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          تجاوز إلى المحتوى
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppButton />
      </CartProvider>
    </FavoritesProvider>
  );
}