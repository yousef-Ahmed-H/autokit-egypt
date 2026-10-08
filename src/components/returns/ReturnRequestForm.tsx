"use client";

import { useState } from "react";
import { createReturnAction, type ReturnFormState } from "@/app/(store)/returns/actions";

const initial: ReturnFormState = {};

export default function ReturnRequestForm() {
  const [state, setState] = useState<ReturnFormState>(initial);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const res = await createReturnAction(formData);
    setState(res);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      {state.success && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          {state.success}
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">رقم الطلب</span>
          <input name="orderNumber" required className="field" dir="ltr" placeholder="AK-20261007-0001" />
        </label>
        <label className="block">
          <span className="label">رقم الهاتف</span>
          <input name="phone" required className="field" dir="ltr" placeholder="01000000000" />
        </label>
        <label className="block sm:col-span-2">
          <span className="label">الاسم بالكامل</span>
          <input name="customerName" required className="field" />
        </label>
        <label className="block sm:col-span-2">
          <span className="label">سبب الاسترجاع</span>
          <select name="reasonCategory" className="field" defaultValue="المنتج مختلف عن الوصف">
            <option>المنتج مختلف عن الوصف</option>
            <option>المنتج تالف أو به عيب</option>
            <option>وصل متأخرًا</option>
            <option>طلبته بالخطأ</option>
            <option>لم يعد بحاجة إليه</option>
            <option>سبب آخر</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="label">تفاصيل السبب</span>
          <textarea name="reasonText" rows={4} required className="field" placeholder="اشرح المشكلة بالتفصيل..." />
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "جارٍ الإرسال..." : "إرسال طلب الاسترجاع"}
      </button>
    </form>
  );
}