import { ORDER_STATUSES, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders/types";

/** خط زمني لحالة الطلب */
export default function StatusTimeline({ status }: { status: OrderStatus }) {
  const special = status === "cancelled" || status === "returned";
  const current = ORDER_STATUSES.find((s) => s.key === status);
  const steps = ORDER_STATUSES.filter((s) => s.step > 0).sort((a, b) => a.step - b.step);

  if (special) {
    return (
      <div
        className={`rounded-xl border p-4 ${
          status === "cancelled" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <p className={`text-sm font-extrabold ${status === "cancelled" ? "text-red-700" : "text-amber-700"}`}>
          حالة الطلب: {ORDER_STATUS_LABEL[status]}
        </p>
        <p className="mt-1 text-[0.8rem] text-ink-600">
          {status === "cancelled"
            ? "تم إلغاء هذا الطلب (بيانات تجريبية)."
            : "تم تسجيل طلب إرجاع لهذا الطلب (بيانات تجريبية)."}
        </p>
      </div>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {steps.map((step) => {
        const done = current ? step.step <= current.step : false;
        return (
          <li
            key={step.key}
            className={`rounded-lg border p-3 text-center text-[0.75rem] font-bold ${
              done ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-400"
            }`}
            aria-current={step.key === status ? "step" : undefined}
          >
            <span className="mb-1 block text-base" aria-hidden>
              {done ? "●" : "○"}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}