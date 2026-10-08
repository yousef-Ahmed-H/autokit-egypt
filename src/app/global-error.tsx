"use client";

import "./globals.css";

/** حدود الخطأ العامة (تفشل في تحميل الجذر) — يجب أن تحتوي على html و body */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen items-center justify-center bg-ink-950 p-6 text-white">
        <div className="max-w-md text-center">
          <p className="text-5xl" aria-hidden>🛠️</p>
          <h1 className="mt-4 text-xl font-extrabold">تعذّر تحميل التطبيق</h1>
          <p className="mt-2 text-sm leading-7 text-ink-300">
            حدث خطأ على مستوى التطبيق. جرّب إعادة التحميل، وإن استمرت المشكلة تواصل مع الدعم.
          </p>
          {error.digest && (
            <p className="mt-2 text-[0.7rem] text-ink-400" dir="ltr">digest: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}