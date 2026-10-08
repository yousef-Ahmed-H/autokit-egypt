import type { Metadata } from "next";
import FavoritesView from "@/components/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "منتجاتك المفضلة محفوظة على جهازك.",
};

export default function FavoritesPage() {
  return (
    <div className="container-x section-y">
      <header className="mb-6">
        <p className="eyebrow mb-1.5">حسابي</p>
        <h1 className="h-section">المفضلة</h1>
      </header>
      <FavoritesView />
    </div>
  );
}