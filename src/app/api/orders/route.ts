import { NextResponse } from "next/server";
import { createOrderFromPayload, type CheckoutPayload } from "@/lib/orders/service";

/**
 * POST /api/orders — إنشاء طلب (الدفع عند الاستلام فقط).
 * يستخدم نفس منطق الـ Server Action حتى تظل القواعد موحّدة.
 */
export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON غير صالح" }, { status: 400 });
  }

  const result = await createOrderFromPayload(payload);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, issues: result.issues },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      duplicate: result.duplicate,
      order: result.order,
      demo: true,
      note: "طلب تجريبي — لا يوجد دفع إلكتروني أو شحن حقيقي.",
    },
    { status: result.duplicate ? 200 : 201 },
  );
}