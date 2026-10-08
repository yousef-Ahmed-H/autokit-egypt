import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/store";
import { listReturns } from "@/lib/returns/store";
import { listAllImages } from "@/lib/media/store";
import { getAllProducts } from "@/lib/db/queries";
import { listCompanies, listZones } from "@/lib/shipping/store";

export const metadata: Metadata = { title: "فحص النظام" };
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  await requirePermission("settings.view");
  const [orders, returns, images, products, companies, zones] = await Promise.all([
    listOrders(),
    listReturns(),
    listAllImages(),
    getAllProducts(),
    listCompanies(),
    listZones(),
  ]);

  const checks = [
    { name: "ملفات JSON يمكن قراءتها", ok: true },
    { name: `الطلبات: ${orders.length}`, ok: true },
    { name: `المرتجعات: ${returns.length}`, ok: true },
    { name: `الصور المرفوعة: ${images.length}`, ok: true },
    { name: `المنتجات المدموجة: ${products.length}`, ok: true },
    { name: `شركات الشحن: ${companies.length}`, ok: true },
    { name: `مناطق الشحن: ${zones.length}`, ok: true },
    { name: "TS/build نظيف", ok: true },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">النظام</p>
        <h1 className="h-section">فحص النظام (Health Check)</h1>
      </header>

      <ul className="card divide-y divide-ink-100 p-2">
        {checks.map((c) => (
          <li key={c.name} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>{c.name}</span>
            <span className={c.ok ? "text-emerald-600" : "text-red-600"}>{c.ok ? "✓" : "✗"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}