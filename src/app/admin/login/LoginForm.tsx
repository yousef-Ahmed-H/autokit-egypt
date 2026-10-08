"use client";

import { useActionState } from "react";
import { initialLoginState } from "@/app/admin/login-state";
import { loginAction } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialLoginState);

  return (
    <form action={formAction} className="card w-full max-w-sm p-6" noValidate>
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ink-950 text-lg font-extrabold text-brand-400" aria-hidden>
          AK
        </span>
        <h1 className="mt-3 text-lg font-extrabold text-ink-950">لوحة تحكم AutoKit</h1>
        <p className="mt-1 text-xs text-ink-500">دخول المشرفين فقط</p>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {state.error}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor="email" className="label">البريد الإلكتروني</label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          defaultValue={state.email ?? ""}
          required
          className="field"
        />
      </div>

      <div className="mt-3">
        <label htmlFor="password" className="label">كلمة المرور</label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>

      {state.need2fa && (
        <div className="mt-3">
          <label htmlFor="code" className="label">رمز المصادقة الثنائية (6 أرقام)</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            dir="ltr"
            autoComplete="one-time-code"
            placeholder="000000"
            className="field"
          />
        </div>
      )}

      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={isPending}>
        {isPending ? "جارٍ التحقق…" : "دخول"}
      </button>

      <p className="mt-4 text-center text-[0.68rem] leading-5 text-ink-400">
        الدخول مسجّل في سجل النشاط، وتُحتسب المحاولات الفاشلة لحماية الحساب.
      </p>
    </form>
  );
}