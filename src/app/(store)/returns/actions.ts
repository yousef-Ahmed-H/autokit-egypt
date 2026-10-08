"use server";

import { revalidatePath } from "next/cache";
import { createReturnRequest } from "@/lib/returns/store";

export interface ReturnFormState {
  success?: string;
  error?: string;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createReturnAction(formData: FormData): Promise<ReturnFormState> {
  const orderNumber = str(formData, "orderNumber");
  const phone = str(formData, "phone");
  const customerName = str(formData, "customerName");
  const reasonCategory = str(formData, "reasonCategory");
  const reasonText = str(formData, "reasonText");

  if (!orderNumber || !phone || !customerName || !reasonText) {
    return { error: "جميع الحقول مطلوبة." };
  }

  try {
    const ret = await createReturnRequest({
      orderNumber,
      phone,
      customerName,
      reasonCategory: reasonCategory || "سبب آخر",
      reasonText,
      images: [],
      actor: customerName,
    });
    revalidatePath("/admin/returns");
    return { success: `تم إرسال طلب الاسترجاع بنجاح. رقم الطلب الداخلي: ${ret.id.slice(0, 8)}` };
  } catch (e) {
    return { error: "تعذّر إرسال الطلب. حاول مرة أخرى." };
  }
}