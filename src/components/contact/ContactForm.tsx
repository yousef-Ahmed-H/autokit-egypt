"use client";

import { useActionState } from "react";
import { initialContactState } from "@/app/actions/contact-state";
import { submitContactAction } from "@/app/actions/contact";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialContactState);
  const values = state.values ?? {};
  const issueFor = (field: string) => state.issues.find((i) => i.field === field)?.message;

  return (
    <form action={formAction} className="card p-5" noValidate>
      <h2 className="text-base font-extrabold text-ink-950">أرسل رسالة</h2>
      <p className="mt-1 text-xs text-ink-400">الرد المعتاد خلال 24 ساعة عمل (بيانات تجريبية).</p>

      {state.status === "success" && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          {state.message}
        </p>
      )}

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {state.message}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-ink-700">الاسم *</label>
          <input id="name" name="name" defaultValue={values.name ?? ""} required className="field" />
          {issueFor("name") && <p className="mt-1 text-[0.72rem] font-bold text-red-600">{issueFor("name")}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-ink-700">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" dir="ltr" defaultValue={values.email ?? ""} className="field" />
          {issueFor("email") && <p className="mt-1 text-[0.72rem] font-bold text-red-600">{issueFor("email")}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-ink-700">رقم الموبايل</label>
          <input id="phone" name="phone" dir="ltr" inputMode="numeric" defaultValue={values.phone ?? ""} className="field" />
          {issueFor("phone") && <p className="mt-1 text-[0.72rem] font-bold text-red-600">{issueFor("phone")}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="subject" className="mb-1.5 block text-xs font-bold text-ink-700">الموضوع</label>
          <input id="subject" name="subject" defaultValue={values.subject ?? ""} className="field" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-ink-700">الرسالة *</label>
          <textarea id="message" name="message" rows={5} defaultValue={values.message ?? ""} required className="field" />
          {issueFor("message") && <p className="mt-1 text-[0.72rem] font-bold text-red-600">{issueFor("message")}</p>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-4 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
      </button>

      <p className="mt-3 text-[0.7rem] leading-6 text-ink-400">
        نموذج تجريبي: الرسائل تُحفظ محليًا لأغراض العرض، ولا تُرسل إلى أي بريد حقيقي.
      </p>
    </form>
  );
}