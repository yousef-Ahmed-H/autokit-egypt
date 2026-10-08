import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/orders/service";
import { ORDER_STATUS_LABEL } from "@/lib/orders/types";

/** GET /api/orders/track?no=AK-...&phone=01xxxxxxxxx */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const no = url.searchParams.get("no") ?? "";
  const phone = url.searchParams.get("phone") ?? "";

  if (!no || !phone) {
    return NextResponse.json(
      { ok: false, error: "رقم الطلب ورقم الهاتف مطلوبان" },
      { status: 400 },
    );
  }

  const order = await trackOrder(no, phone);
  if (!order) {
    return NextResponse.json(
      { ok: false, error: "لم يتم العثور على طلب مطابق. تأكد من رقم الطلب ورقم الهاتف." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: ORDER_STATUS_LABEL[order.status],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totals: order.totals,
      items: order.items,
    },
  });
}