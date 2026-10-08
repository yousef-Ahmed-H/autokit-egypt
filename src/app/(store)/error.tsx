"use client";

import Link from "next/link";
import { useEffect } from "react";

/** حدود الخطأ (Error Boundary) — تُعرض عند حدوث خطأ غير متوقع */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // مكان مناسب لإرسال الخطأ لخدمة تتبع (Sentry مثلاً) لاحقًا
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="container-x section-y">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl" aria-hidden>⚠️</p>
        <h1 className="mt-4 text-xl font-extrabold text-ink-950">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm leading-7 text-ink-500">
          نعتذر عن الإزعاج — يمكنك إعادة المحاولة، وإذا تكرر الخطأ تواصل معنا على واتساب.
        </p>
        {error.digest && (
          <p className="mt-2 text-[0.7rem] text-ink-400" dir="ltr">
            digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn btn-primary">
            إعادة المحاولة
          </button>
          <Link href="/" className="btn btn-outline">الصفحة الرئيسية</Link>
          <Link href="/contact" className="btn btn-outline">تواصل معنا</Link>
        </div>
      </div>
    </div>
  );
}